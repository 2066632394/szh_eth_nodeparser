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
	var DB = new Dbobject(dbConfig.pooldb);
	DB.createPool();
	
	// web3
	var Web3 = require('web3');
	var web3 = new Web3();
	//web3.setProvider(new web3.providers.HttpProvider("http://120.27.97.197:8545"));
	web3.setProvider(new web3.providers.HttpProvider("http://eth.bityuan.com"));
	// 合约地址配置
	
	var contractConfig = require('./config/contract.js');
	// 获取配置合约地址集合	
	function getContractAddersses() {
		var contractAddersses = [];
		for(var key in contractConfig) {
			contractAddersses.push(key);
		}
		return contractAddersses;
	}
    var coindbCache = {}
	// 获取合约属性对象
	function getCoindb(contractAdderss) {
		//console.log('----------');
        if (coindbCache[contractAdderss]) {
            return coindbCache[contractAdderss];
        }
		var coindb = web3.eth.contract(contractConfig[contractAdderss].abiJson).at(contractAdderss);
        coindb.abimap = getAbiFunIndexes(coindb);
        coindbCache[contractAdderss] = coindb;
        //console.log('=========');
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
		var top = web3.eth.blockNumber;
		console.log(top);
		//return;
        var blocknumber =2247;
	var list = [];
	for(var i = 1;i<=top;i++){
		list.push(i);
	}
	var t1 = new Date().getTime();
        web3.eth.getBlock(blocknumber, true, function(err,block){
            if (err) {
                console.log('block err :'+err);
            }
            //var stime = new Date().getTime();
	    //console.log(stime-t1);
            //var coindb = getCoindb("0x3cc9e1e6b0a280fc3d1041d766299482cf0da36d")
            //parseBlock(block)
            var etime = new Date().getTime();
            console.log(etime - t1)
        })
    }

	function parseBlock(block) {
		var txs = block.transactions;
		var receipts = block.receipts;
		logger.info("txns-----"+txs.length);
        var n = 0;
		for (var j = 0; j < txs.length; j++) {
			//console.log("tx", txs[j].hash);
			if(getContractAddersses().indexOf(txs[j].to) == "-1") {	
				txs[j]["func"] = "null";
				txs[j]["args"] = null;
				txs[j]["cumulativeGasUsed"] = receipts[j].cumulativeGasUsed; //receipt 
				txs[j]["gasUsed"] = receipts[j].gasUsed; //receipt 
				txs[j]["logs"] = receipts[j].logs; //receipt 
				txs[j]['timestamp'] = block.timestamp;
			} else {
				var inputDecode = parseTxInput(txs[j].to, txs[j].input);
                n++
				txs[j]["func"] = inputDecode["func"];
				txs[j]["args"] = inputDecode["args"];
				txs[j]['timestamp'] = block.timestamp;
				var coindb = getCoindb(txs[j].to);
				if(receipts[j] != null) {
	                for (var k = 0; k < receipts[j].logs.length; k++) {
                        coindb.decodeLog(receipts[j].logs[k]);
                        n++;
					}
					txs[j]["cumulativeGasUsed"] = receipts[j].cumulativeGasUsed; //receipt 
					txs[j]["gasUsed"] = receipts[j].gasUsed; //receipt 
					txs[j]["logs"] = receipts[j].logs; //receipt 
					if(contractConfig[txs[j].to].script != "" 
						&& receipts[j].logs.length != 0 
						&& typeof receipts[j].logs[0].event != "undefined" 
						&& receipts[j].logs[0].event != "Error") {
						txs[j]['timestamp'] = block.timestamp;
					}	
				}
			}
		}
        console.log("parse count = ", n)
    }	

	function parseBlockNew(block) {
		var txs = block.transactions;
		var receipts = block.receipts;
		logger.info("txns-----"+txs.length);
        var n = 0;
		for (var j = 0; j < txs.length; j++) {
			//console.log("tx", txs[j].hash);
			if(getContractAddersses().indexOf(txs[j].to) == "-1") {	
				txs[j]["func"] = "null";
				txs[j]["args"] = null;
				txs[j]["cumulativeGasUsed"] = receipts[j].cumulativeGasUsed; //receipt 
				txs[j]["gasUsed"] = receipts[j].gasUsed; //receipt 
				txs[j]["logs"] = receipts[j].logs; //receipt 
				txs[j]['timestamp'] = block.timestamp;
			} else {
				var inputDecode = parseTxInput(txs[j].to, txs[j].input);
                n++
				txs[j]["func"] = inputDecode["func"];
				txs[j]["args"] = inputDecode["args"];
				txs[j]['timestamp'] = block.timestamp;
				var coindb = getCoindb(txs[j].to);
				if(receipts[j] != null) {
	                for (var k = 0; k < receipts[j].logs.length; k++) {
                        coindb.decodeLog(receipts[j].logs[k]);
                        n++;
					}
					txs[j]["cumulativeGasUsed"] = receipts[j].cumulativeGasUsed; //receipt 
					txs[j]["gasUsed"] = receipts[j].gasUsed; //receipt 
					txs[j]["logs"] = receipts[j].logs; //receipt 
					if(contractConfig[txs[j].to].script != "" 
						&& receipts[j].logs.length != 0 
						&& typeof receipts[j].logs[0].event != "undefined" 
						&& receipts[j].logs[0].event != "Error") {
						txs[j]['timestamp'] = block.timestamp;
					}	
				}
			}
		}
        console.log("parse count = ", n)
    }



	// 解析交易的input
	function parseTxInput(contractAdderss, input) {
		var coindb = getCoindb(contractAdderss);
        var matchname = coindb.abimap[input.slice(2, 10)];
        var match = coindb[matchname];
		var inputDecode = [];		
		if (!match) { // cannot find matching event?
			inputDecode["func"] = "null";
			inputDecode["args"] = null;
            console.log("func not match")
		} else {
			inputDecode["func"] = matchname;
			inputDecode["args"] = match.unpackArgs(input);
		}
        //console.log(inputDecode)
		return inputDecode;
	}

}
