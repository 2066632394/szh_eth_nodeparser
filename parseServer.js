var cluster = require('cluster');
var http=require('http');
var url = require('url');
var cpu_num = require('os').cpus().length;
var cpu_num = 4;
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://192.168.1.33:8545"));
var contractConfig = require('./config/contract.js');
function getContractAddersses() {
	var contractAddersses = [];
	for(var key in contractConfig) {
		contractAddersses.push(key);
	}
	return contractAddersses;
}
var coindbCache = {}
function getCoindb(contractAdderss) {
	if (coindbCache[contractAdderss]) {
		return coindbCache[contractAdderss];
	}
	var coindb = web3.eth.contract(contractConfig[contractAdderss].abiJson).at(contractAdderss);
	coindb.abimap = getAbiFunIndexes(coindb);
	coindbCache[contractAdderss] = coindb;
}
function getAbiFunIndexes(coindb) {
	var coindbabis = coindb.abi;
	var coindbabiids = {};
	for (var i in coindbabis) {
		if (coindb[coindbabis[i].name] != undefined) {
			if ('signature' in coindb[coindbabis[i].name]) {
				coindbabiids[coindb[coindbabis[i].name].signature()] = coindbabis[i].name;
			}
		}
	}
	return coindbabiids;
}
var address = '0xb10862b9f9d15a18c72ed31afdd4a069daaf9329';
var coindb = getCoindb(address);
if (cluster.isMaster) {
	console.log("==启动主进程==");

	for (var i = 0; i < cpu_num; i++) {
		cluster.fork();
	}

	cluster.on('listening',function(worker,address){
		console.log('listening: worker ' + worker.process.pid);
	});

	cluster.on('exit', function(worker, code, signal) {
		console.log('exit worker ' + worker.process.pid + ' died');
	});
} else {
	http.createServer(function(req, res) {
		var arg = url.parse(req.url).query;
		res.writeHead(200,{"Content-Type":"text/json"});
		if (req.method.toUpperCase() == 'POST') {
			var postData = [];
			req.addListener("data", function (data) {
				postData.push(data);
			});
			req.addListener("end", function () {
				var data = Buffer.concat(postData).toString();
				var params= JSON.parse(data);
				var log = params['log'];
				console.log(cluster.worker.id);
				console.log(params);
				res.end(log);
			})
		}
	}).listen(8888);
}

