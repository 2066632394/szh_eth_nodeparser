// 多进程模块cluster
var cluster = require('cluster');
var async = require('async');
var log4js = require('log4js');
var log4js_conf = require('./log4js.json');
log4js.configure(log4js_conf);
var logger = log4js.getLogger('log_date');
logger.info('server is running ');
var workers = 1;
if (cluster.isMaster) {
	console.log('start cluster with %s workers', workers);
	for (var i = 0; i < workers; ++i) {
		var worker = cluster.fork().process;
		console.log('worker %s started.', worker.pid);
	}
    cluster.on('exit', function(worker) {
		console.log('worker %s died. restart...', worker.process.pid);
		cluster.fork();
	});
} else {
	// mysql
	var dbConfig = require('./config/db.js');
	var Dbobject = require('./lib/poolClient.js');
	var DB = new Dbobject(dbConfig.pooldb1);
	DB.createPool();
	var Web3 = require('web3');
	var web3 = new Web3();
	web3.setProvider(new web3.providers.HttpProvider("http://122.224.77.187:8545"));

	var contractConfig = require('./config/contract.js');
	// 获取配置合约地址集合	
	function getContractAddersses() {
		var contractAddersses = [];
		for(var key in contractConfig) {
			contractAddersses.push(key);
		}
		return contractAddersses;
	}
	// 获取合约属性对象
	function getCoindb(contractAdderss) {
		return web3.eth.contract(contractConfig[contractAdderss].abiJson).at(contractAdderss);
	}
	// ABI函数集合 
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


	run();

	function run(){
		console.log("new block is pedding");
		DB.findAll("transactions",'hash,func,args,logs,towhere',logback,{'condition':'status=0','limit':10,'order':'addtime asc'});
	}


	function logback(rows){

		if(rows.length != 0){

			async.forEach(rows,function(row,callback){
				if(row.hash != 'undefined'){
					console.log('hash :'+row.hash);
					var ParseContract = require('./contractscript/parseContract.js');
					var data = new ParseContract(row);
					updateLog(data,function(error,cb){
						if(error){
							console.log('error is : '+error);
							callback(error,data);
						}
						callback(null,data);
					})
				}
			},function(err){
				if(err){
					console.log("err is :"+err);
				}
				run();
			})

		}else{
			setTimeout(run, 1000);
		}
	}


	function updateLog(data,callback){
		DB.update('transactions',{'receiptlogs':JSON.stringify(data.data.receipt),'input_source':JSON.stringify(data.data.input),'status':1},updateback,{'condition':"hash='"+data.hash +"'"});
		callback(null,'ok');
	}

	function updateback(res){
		//console.log('res : '+JSON.stringify(res));
	}







    function isEmptyObject(e) {  
	    var t;  
	    for (t in e)  
	        return !1;  
	    return !0  
	}  


}