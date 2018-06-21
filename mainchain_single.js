// 多进程模块cluster
var cluster = require('cluster');
var async = require('async');
/*var log4js = require('log4js');
var log4js_conf = require('./log4js.json');
log4js.configure(log4js_conf);
var logger = log4js.getLogger('log_date');
logger.info('server is running ');*/
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

	/*var bluebird = require('bluebird');
	var redis = require('redis');
	bluebird.promisifyAll(redis.RedisClient.prototype);
	bluebird.promisifyAll(redis.Multi.prototype);

	var client = redis.createClient(6379,'10.26.91.117',{});
	client.auth('Fuzamei7799',redis.print);

	client.on('error',function(err){
		console.log('error on '+err);
		client.quit();
	})*/

	// web3
	var Web3 = require('web3');
	var web3 = new Web3();
	web3.setProvider(new web3.providers.HttpProvider("http://122.224.124.250:8545"));
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
        if (coindbCache[contractAdderss]) {
            return coindbCache[contractAdderss];
        }
		var coindb = web3.eth.contract(contractConfig[contractAdderss].abiJson).at(contractAdderss);
        coindb.abimap = getAbiFunIndexes(coindb);
        coindbCache[contractAdderss] = coindb;
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
	
	var loopStart;

//    getLoopStartBlock();

	// 获取数据库最大的blocknumber
	function getLoopStartBlock() {
		console.log('select mysql');
		var order = "block DESC";
		DB.findOne("blocks", "*", callGetLoopStartBlock, {'limit':1, 'order':order});
	}
	// 获取数据库最大的blocknumber回调
	function callGetLoopStartBlock(row) {

		var list = [];
		if(row.length != 0 && row.block != "undefined") {	
			console.log('loopstart : '+row.block);		
			loopStart = row.block+1;
		} else {
			loopStart = 1;
		}
		//return ;
		var top = web3.eth.blockNumber;//接口反应时间200ms
		//client.getAsync('block_top').then(function(top){
			if(top){
				top = Number(top);
			}else{
				// top = web3.eth.blockNumber;
				// if(top == 'undefined'){
					console.log('---------------disconnect to contract----------------');
					setTimeout(function(){
						getLoopStartBlock()
					},500);
				//}
			}
			if(1 || top>=loopStart){
				//top = 998;
				var limit = top-loopStart+1;
				if(limit>1000){
					limit = 1000;
				}
				var loopEnd = loopStart+limit;
				for (var i = loopStart; i <loopEnd ; i++) {
					list.push(i);
				}
				list = [21570];
				console.log(list);
				async.eachSeries(list,function(item,callback){
					console.log('start block :'+item);
					var stime = new Date().getTime();
					/*client.hgetAsync(['block',item]).then(function(block){
						if(block){
							
							block = JSON.parse(block);
							console.log(block);
							return;
							insertBlock1(block,function(err,bcallback){
								if(err){
									callback(err,block);
								}
								parseBlock(block);
								var etime = new Date().getTime();
								console.log('parse block ------------------'+(etime-stime));
								console.log('block rxnum------------------'+block.transactions.length);
								callback(null,item);
							});

							// client.setAsync(['block_insert',item]).then(function(res){
							// 	if(res){
							// 		//console.log(item + ' block_insert redis :'+res);
							// 		console.log(item+'444444444');
							// 		var etime = new Date().getTime();
							// 		console.log('redis parse block ------------------'+(etime-stime));
							// 		callback(null,item);
							// 	}
							// })
							
						}else{*/
							web3.eth.getBlock(item, true, function(err, block){
								if (err != null) {
									console.log(err)
									throw new Error("panic");
									callback(err,block);
								}
								
								insertBlock1(block,function(err,bcallback){
									if(err){
										callback(err,block);
									}
									parseBlock(block);
									var etime = new Date().getTime();
									console.log('------------'+(etime-stime));
									callback(null,item);
								});
								//insertBlock(block);
								//parseBlock(block);
								//var etime = new Date().getTime();
								//console.log('web3 parse block ------------------'+(etime-stime));
								//callback(null,item);
							})
						/*}
					})*/
				},function(error){
					if(error){
						console.log('eachasync error :'+error);
					}
					getLoopStartBlock();
				})					
			}else{
				console.log('new block is pedding!');
				setTimeout(function(){
					getLoopStartBlock()
				}, 500);
			}
			
		//})

	}	
	parseBlock();
	
	// 解析区块
	function parseBlock(block) {
		var block = '{"difficulty":"375511479","extraData":"0xd783010409844765746887676f312e362e33856c696e7578","gasLimit":471238800,"gasUsed":155850,"hash":"0x302f8d6d4b2986caea13ec1f5136e8988ff176cc883e5ff9f4fada5a13701f03","logsBloom":"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000000000001000000000100000020000000000000100000000000000040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000080000000000000000000000000000000000000000000080000000000000001000000001000000000000000000000","miner":"0x24730fa00acc7a4bedc44b4df8156ea8edd781da","nonce":"0x0000000000000000","number":21570,"parentHash":"0x8ea469a31677416b1f1181dc5d0de11d68a7f62e29df86b864ab51063fddb166","receiptRoot":"0xdb611aabdd80d1036cd3da5dc489d80498d53636c657a0112cfaca4e95f924af","receipts":[{"txhash":"0x40e182a44652655136d2622b47e27a0d64f69c78d49dc14042dd96aa6bf755ac","gasUsed":"0xcaee","cumulativeGasUsed":"0xcaee","logs":[{"address":"0xb2b8b4adf1d2ba82029bba554858653e58867b55","blockHash":"0x302f8d6d4b2986caea13ec1f5136e8988ff176cc883e5ff9f4fada5a13701f03","blockNumber":"0x5442","data":"0x4f494c0000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffca5b17000000000000000000000000000000000000000000000000000000000035a4e900","logIndex":"0x0","topics":["0x1c83097d23bab48d7d8b511ba601de219d5275ff71ee21dbf650758982ccfe1e","0x0000000000000000000000000e07e83070686c0084d0295f61fb0cdbb9d71d88"],"transactionHash":"0x40e182a44652655136d2622b47e27a0d64f69c78d49dc14042dd96aa6bf755ac","transactionIndex":"0x0"},{"address":"0xb2b8b4adf1d2ba82029bba554858653e58867b55","blockHash":"0x302f8d6d4b2986caea13ec1f5136e8988ff176cc883e5ff9f4fada5a13701f03","blockNumber":"0x5442","data":"0x0000000000000000000000000000000000000000000000000000000000000877000000000000000000000001dcd6500000000000000000000000000035a4e900","logIndex":"0x1","topics":["0x7b2b4f7e07934eaa8afde1ce4b062f10034dcde4999571cab35e92b947bc3d93","0x0000000000000000000000000e07e83070686c0084d0295f61fb0cdbb9d71d88"],"transactionHash":"0x40e182a44652655136d2622b47e27a0d64f69c78d49dc14042dd96aa6bf755ac","transactionIndex":"0x0"}]},{"txhash":"0xf2f2cb3e79ab341200cfe7abdfbc630cbf948dd2f685df6bed43a2f882cf7554","gasUsed":"0xcaee","cumulativeGasUsed":"0x195dc","logs":[{"address":"0xb2b8b4adf1d2ba82029bba554858653e58867b55","blockHash":"0x302f8d6d4b2986caea13ec1f5136e8988ff176cc883e5ff9f4fada5a13701f03","blockNumber":"0x5442","data":"0x4f494c0000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffe8287c000000000000000000000000000000000000000000000000000000000017d78400","logIndex":"0x2","topics":["0x1c83097d23bab48d7d8b511ba601de219d5275ff71ee21dbf650758982ccfe1e","0x0000000000000000000000000e07e83070686c0084d0295f61fb0cdbb9d71d88"],"transactionHash":"0xf2f2cb3e79ab341200cfe7abdfbc630cbf948dd2f685df6bed43a2f882cf7554","transactionIndex":"0x0"},{"address":"0xb2b8b4adf1d2ba82029bba554858653e58867b55","blockHash":"0x302f8d6d4b2986caea13ec1f5136e8988ff176cc883e5ff9f4fada5a13701f03","blockNumber":"0x5442","data":"0x0000000000000000000000000000000000000000000000000000000000000878000000000000000000000001df38aa0000000000000000000000000017d78400","logIndex":"0x3","topics":["0x7b2b4f7e07934eaa8afde1ce4b062f10034dcde4999571cab35e92b947bc3d93","0x0000000000000000000000000e07e83070686c0084d0295f61fb0cdbb9d71d88"],"transactionHash":"0xf2f2cb3e79ab341200cfe7abdfbc630cbf948dd2f685df6bed43a2f882cf7554","transactionIndex":"0x0"}]},{"txhash":"0x0ecea13e3a9e5b698deef5bc78e46b51598932396d40a1f535d4b26f56daacf3","gasUsed":"0xcaee","cumulativeGasUsed":"0x260ca","logs":[{"address":"0xb2b8b4adf1d2ba82029bba554858653e58867b55","blockHash":"0x302f8d6d4b2986caea13ec1f5136e8988ff176cc883e5ff9f4fada5a13701f03","blockNumber":"0x5442","data":"0x4f494c0000000000000000000000000000000000000000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffe2329b00000000000000000000000000000000000000000000000000000000001dcd6500","logIndex":"0x4","topics":["0x1c83097d23bab48d7d8b511ba601de219d5275ff71ee21dbf650758982ccfe1e","0x0000000000000000000000000e07e83070686c0084d0295f61fb0cdbb9d71d88"],"transactionHash":"0x0ecea13e3a9e5b698deef5bc78e46b51598932396d40a1f535d4b26f56daacf3","transactionIndex":"0x0"},{"address":"0xb2b8b4adf1d2ba82029bba554858653e58867b55","blockHash":"0x302f8d6d4b2986caea13ec1f5136e8988ff176cc883e5ff9f4fada5a13701f03","blockNumber":"0x5442","data":"0x0000000000000000000000000000000000000000000000000000000000000879000000000000000000000001e1026d800000000000000000000000001dcd6500","logIndex":"0x5","topics":["0x7b2b4f7e07934eaa8afde1ce4b062f10034dcde4999571cab35e92b947bc3d93","0x0000000000000000000000000e07e83070686c0084d0295f61fb0cdbb9d71d88"],"transactionHash":"0x0ecea13e3a9e5b698deef5bc78e46b51598932396d40a1f535d4b26f56daacf3","transactionIndex":"0x0"}]}],"size":1291,"stateRoot":"0x7c1f05e150c14169579bdf8abe431ae4236e0d754a35168760176237a15169f1","timestamp":1473326482,"totalDifficulty":"2123191004733","transactions":[{"blockHash":"0x302f8d6d4b2986caea13ec1f5136e8988ff176cc883e5ff9f4fada5a13701f03","blockNumber":21570,"from":"0x0e07e83070686c0084d0295f61fb0cdbb9d71d88","gas":1000000,"gasPrice":"21783080000","hash":"0x40e182a44652655136d2622b47e27a0d64f69c78d49dc14042dd96aa6bf755ac","input":"0xb401b7794f494c434e59000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001dcd650000000000000000000000000000000000000000000000000000000000035a4e9000000000000000000000000000000000000000000000000000000000000000000","nonce":2248,"to":"0xb2b8b4adf1d2ba82029bba554858653e58867b55","transactionIndex":0,"value":"0"},{"blockHash":"0x302f8d6d4b2986caea13ec1f5136e8988ff176cc883e5ff9f4fada5a13701f03","blockNumber":21570,"from":"0x0e07e83070686c0084d0295f61fb0cdbb9d71d88","gas":1000000,"gasPrice":"21783080000","hash":"0xf2f2cb3e79ab341200cfe7abdfbc630cbf948dd2f685df6bed43a2f882cf7554","input":"0xb401b7794f494c434e59000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001df38aa000000000000000000000000000000000000000000000000000000000017d784000000000000000000000000000000000000000000000000000000000000000000","nonce":2249,"to":"0xb2b8b4adf1d2ba82029bba554858653e58867b55","transactionIndex":1,"value":"0"},{"blockHash":"0x302f8d6d4b2986caea13ec1f5136e8988ff176cc883e5ff9f4fada5a13701f03","blockNumber":21570,"from":"0x0e07e83070686c0084d0295f61fb0cdbb9d71d88","gas":1000000,"gasPrice":"21783080000","hash":"0x0ecea13e3a9e5b698deef5bc78e46b51598932396d40a1f535d4b26f56daacf3","input":"0xb401b7794f494c434e59000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001e1026d80000000000000000000000000000000000000000000000000000000001dcd65000000000000000000000000000000000000000000000000000000000000000000","nonce":2250,"to":"0xb2b8b4adf1d2ba82029bba554858653e58867b55","transactionIndex":2,"value":"0"}],"transactionsRoot":"0x5aaf003a87ef458e90839e8d726fddc1849114474dfc6fed18c18d2d1dbdf913"}';
		var block = JSON.parse(block);
		var txs = block.transactions;
		var receipts = block.receipts;
		
		// 暂时考虑一个块里只有一个合约地址
		var contractAdderss = '';
		for (var j = 0; j < txs.length; j++) {			
			if(getContractAddersses().indexOf(txs[j].to) == "-1") {	
			} else {
				contractAdderss = txs[j].to;
			}

		}
		contractAddress = '0xb2b8b4adf1d2ba82029bba554858653e58867b55';
		//console.log(contractAdderss);
		if(contractAdderss.substr(0,2) == '0x'){
			var coindb = getCoindb(contractAdderss);
		}
		
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
				//var inputDecode = parseTxInput2(coindb,txs[j].to, txs[j].input);
				var inputDecode = parseTxInputNew(txs[j].to, txs[j].input);
				txs[j]["func"] = inputDecode["func"];
				//console.log(txs[j]["func"]);
				txs[j]["args"] = inputDecode["args"];
				txs[j]['timestamp'] = block.timestamp;
				//console.log(coindb);return;
				var coindb = getCoindb(txs[j].to);
				if(receipts[j] != null){
					for (var k = 0; k < receipts[j].logs.length; k++) {									
						coindb.decodeLog(receipts[j].logs[k]);
					}
					txs[j]["cumulativeGasUsed"] = receipts[j].cumulativeGasUsed; //receipt 
					txs[j]["gasUsed"] = receipts[j].gasUsed; //receipt 
					txs[j]["logs"] = receipts[j].logs; //receipt 
					if(contractConfig[txs[j].to].script != "" 
						&& receipts[j].logs.length != 0 
						&& typeof receipts[j].logs[0].event != "undefined" 
						&& receipts[j].logs[0].event != "Error") {
						var insertContract = require('./contractscript/'+contractConfig[txs[j].to].script);
						//txs[j]['timestamp'] = block.timestamp;
						//new insertContract(txs[j], receipts[j]);
					}	
				}
			
				

			}
			//txs[j]['timestamp'] = block.timestamp;
			//insertAccount(txs[j].to,txs[j].from);//更新用户地址
		}
		if(txs.length != 0) {
			txs['timestamp'] = block.timestamp;
			insertTxsList(txs);
		}	
	}
	
	// 解析交易的input
	function parseTxInput(contractAdderss, input) {
		var coindb = getCoindb(contractAdderss);
		var match = contractConfig[contractAdderss].abiJson.filter(function (jsondata) {			
			if (!jsondata)
			{
				return false;
			}
			if (!jsondata.name) {
				return false;
			}
			if (!coindb[jsondata.name] || !coindb[jsondata.name].signature) {
				return false;
			}
			if (coindb[jsondata.name].signature() == input.slice(2, 10)) {
				return true;
			}
		})
		var inputDecode = [];		
		if (!match || match.length == 0) { // cannot find matching event?
			inputDecode["func"] = "null";
			inputDecode["args"] = null;
		} else {			
			inputDecode["func"] = match[0].name;
			inputDecode["args"] = coindb[match[0].name].unpackArgs(input);
		}
		
		return inputDecode;
	}	
	
	// 解析交易的input
	function parseTxInput2(coindb, contractAdderss,input) {
		var match = contractConfig[contractAdderss].abiJson.filter(function (jsondata) {			
			if (!jsondata)
			{
				return false;
			}
			if (!jsondata.name) {
				return false;
			}
			if (!coindb[jsondata.name] || !coindb[jsondata.name].signature) {
				return false;
			}
			if (coindb[jsondata.name].signature() == input.slice(2, 10)) {
				return true;
			}
		})
		var inputDecode = [];		
		if (!match || match.length == 0) { // cannot find matching event?
			inputDecode["func"] = "null";
			inputDecode["args"] = null;
		} else {			
			inputDecode["func"] = match[0].name;
			inputDecode["args"] = coindb[match[0].name].unpackArgs(input);
		}
		return inputDecode;
	}


	// 解析交易的input
	function parseTxInputNew(contractAdderss, input) {
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
	
	// block数据插入
	function insertBlock(block) {
		//console.log("insert block", block.number);
		var insertData = {
			block : block.number,
			miner : block.miner,
			hash : block.hash,
			difficulty : Number(block.difficulty),
			gas_limit : block.gasLimit,
			gas_used : block.gasUsed,
			parent_hash : block.parentHash,
			nonce : block.nonce,
			transactions_root : block.transactionsRoot,
			tx_num : block.transactions.length,
			state_root : block.stateRoot,
			receipt_root : block.receiptRoot,
			receipt_num : block.receipts.length,
			total_difficulty : Number(block.totalDifficulty),
			size : block.size,
			extra_data : block.extraData,
			logs_bloom : block.logsBloom,  
			time : block.timestamp,
			addtime : Date.now(),
		};
		//console.log(insertData);
		//DB.findOne("blocks", "*", function(row){console.log(row.block)}, {'limit':1, 'order':'block DESC'});
		DB.insert("blocks", insertData);	
	}
	
	// block数据插入
	function insertBlock1(block,callback) {
		var insertData = {
			block : block.number,
			miner : block.miner,
			hash : block.hash,
			difficulty : Number(block.difficulty),
			gas_limit : block.gasLimit,
			gas_used : block.gasUsed,
			parent_hash : block.parentHash,
			nonce : block.nonce,
			transactions_root : block.transactionsRoot,
			tx_num : block.transactions.length,
			state_root : block.stateRoot,
			receipt_root : block.receiptRoot,
			receipt_num : block.receipts.length,
			total_difficulty : Number(block.totalDifficulty),
			size : block.size,
			extra_data : block.extraData,
			logs_bloom : block.logsBloom,  
			time : block.timestamp,
			addtime : Date.now(),
		};
		//console.log(insertData);
		//DB.findOne("blocks", "*", function(row){console.log(row.block)}, {'limit':1, 'order':'block DESC'});
		DB.insert("blocks", insertData,function(result){
			if(result.length != 0 && result.affectedRows == 1){
				console.log('ok');
				callback(null,'ok');
			}else{
				callback('insert err');
			}
		});	
	}
	
	// tx插入
	function insertTx(tx) {		
		console.log("tx", tx.hash);		
		var insertData = {
			hash : tx.hash,
			nonce : tx.nonce,
			blockhash : tx.blockHash,
			blocknumber : tx.blockNumber,
			tindex : tx.transactionIndex,
			tfrom : tx.from,
			towhere : tx.to,
			value : tx.value.toNumber(),
			gas : tx.gas,
			gasprice : tx.gasPrice.toNumber(),
			input : tx.input,
			time : tx.timestamp,//web3.eth.getBlock(tx.blockNumber).timestamp,
			func : tx.func,
			args : JSON.stringify(tx.args),
			cumulative_gas_used : web3.toDecimal(tx.cumulativeGasUsed),
			gas_used : web3.toDecimal(tx.gasUsed),
			logs : JSON.stringify(tx.logs),
			addtime : Date.now(),
		};
		DB.insert("transactions", insertData);
	}	
	
	// tx批量插入
	function insertTxsList(txs) {
		var insertData = [];
		for(var i = 0; i < txs.length; i++) {
			insertData.push({
				hash : txs[i].hash,
				nonce : txs[i].nonce,
				blockhash : txs[i].blockHash,
				blocknumber : txs[i].blockNumber,
				tindex : txs[i].transactionIndex,
				tfrom : txs[i].from,
				towhere : txs[i].to,
				value : Number(txs[i].value),
				gas : txs[i].gas,
				gasprice : Number(txs[i].gasPrice),
				input : txs[i].input,
				time : txs.timestamp,//web3.eth.getBlock(txs[i].blockNumber).timestamp,
				func : txs[i].func,
				args : JSON.stringify(txs[i].args),
				cumulative_gas_used : web3.toDecimal(txs[i].cumulativeGasUsed),
				gas_used : web3.toDecimal(txs[i].gasUsed),
				logs : JSON.stringify(txs[i].logs),
				addtime : Date.now(),
			})
		}
		DB.insertList("transactions", insertData);		
	}

	function insertAccount(to,from){
		var todata = {
			account : to,
		};
		var fromdata = {
			account : from,
		};
		DB.replace('accounts',todata);
		DB.replace('accounts',fromdata);
	}

	// // 清除大于blocknumber的数据
	// function clearDB(blocknumber) {
	// 	DB.delete("blocks", {condition:"block > "+blocknumber});
	// 	DB.delete("transactions", {condition:"blocknumber > "+blocknumber});
	// 	// 清除对应合约表数据
	// 	clearContractDB(blocknumber);
	// }	

	// function clearContractDB(blocknumber) {
	// 	for(var key in contractConfig) {
	// 		//console.log(contractConfig[key].table);
	// 		if(contractConfig[key].table.length != 0) {
	// 			for(var i=0; i<contractConfig[key].table.length; i++) {
	// 				//console.log(contractConfig[key].table[i]);
	// 				DB.delete(contractConfig[key].table[i], {condition:"blocknumber > "+blocknumber});
	// 			}
	// 		}
	// 	}
	// }	
}	
	
	
	
	
	
	
	
	
