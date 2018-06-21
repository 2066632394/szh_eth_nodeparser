// 多进程模块cluster
var cluster = require('cluster');
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
	
	// web3
	var Web3 = require('web3');
	var web3 = new Web3();
	web3.setProvider(new web3.providers.HttpProvider("http://122.224.77.187:8545"));
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
	
	var loopStart; //= 657420;
	var clearNum;// 清除数据库blocknumber
	var step = 5;

    getLoopStartBlock();

	// 获取数据库最大的blocknumber
	function getLoopStartBlock() {
		var order = "block DESC";
		DB.findOne("blocks", "*", callGetLoopStartBlock, {'limit':1, 'order':order});
	}
	// 获取数据库最大的blocknumber回调
	function callGetLoopStartBlock(row) {
		if(row.length != 0 && row.block != "undefined") {
			loopStart = row.block+1;
			console.log('start -----'+loopStart);
			clearNum = loopStart-1;
			//clearDB(clearNum);
			setTimeout(function () {
				blockLoop();
			}, 5000)
		} else {
			console.log(row);
			loopStart = 1;
			blockLoop();
		}
	}	
	
	// 按区块高度循环 递归控制循环  一个块 插入解析完成之后 再进行下一个操作 
	function blockLoop() {
		var stime = new Date().getTime();
		var topblock = web3.eth.blockNumber;
		if(loopStart > topblock) {
			console.log(loopStart+" is pendding!");
			setTimeout(function () {
				blockLoop();
			}, 500)
			//return;
		} else {
			web3.eth.getBlock(loopStart, true, function(err, block){
				if (err != null) {
					console.log(err)
					throw new Error("panic");
					getLoopStartBlock();
				}

				parseBlock(block);
				var etime = new Date().getTime();
				console.log('runtime------------------------------'+(etime-stime)/1000+'s');
				logger.info('runtime------------------------------'+(etime-stime)/1000+'s');
				loopStart++;
				blockLoop();		
			})
		}
	}
	
	// 解析区块
	function parseBlock(block) {

		insertBlock(block);// block插入

		var txs = block.transactions;
		var receipts = block.receipts;
		logger.info("txns-----"+txs.length);
		for (var j = 0; j < txs.length; j++) {
			console.log("tx", txs[j].hash);
			if(getContractAddersses().indexOf(txs[j].to) == "-1") {	
				txs[j]["func"] = "null";
				txs[j]["args"] = null;

				txs[j]["cumulativeGasUsed"] = receipts[j].cumulativeGasUsed; //receipt 
				txs[j]["gasUsed"] = receipts[j].gasUsed; //receipt 
				txs[j]["logs"] = receipts[j].logs; //receipt 
				txs[j]['timestamp'] = block.timestamp;
			} else {
				var inputDecode = parseTxInput(txs[j].to, txs[j].input);
				txs[j]["func"] = inputDecode["func"];
				txs[j]["args"] = inputDecode["args"];
				txs[j]['timestamp'] = block.timestamp;
				//console.log(txs[j]["func"]);
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
						new insertContract(txs[j], receipts[j]);
					}	
				}
				//console.log(txs[j], "here");
				

			}
			//txs[j]['timestamp'] = block.timestamp;
			insertAccount(txs[j].to,txs[j].from);//更新用户地址
		}
		if(txs.length != 0) {
			txs['timestamp'] = block.timestamp;
			insertTxsList(txs);
		}	
		//console.log(receipts);
		//console.log(txs, "11111111");
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

	// block数据插入
	function insertBlock(block) {
		console.log("block", block.number);
		var insertData = {
			block : block.number,
			miner : block.miner,
			hash : block.hash,
			difficulty : block.difficulty.toNumber(),
			gas_limit : block.gasLimit,
			gas_used : block.gasUsed,
			parent_hash : block.parentHash,
			nonce : block.nonce,
			transactions_root : block.transactionsRoot,
			tx_num : block.transactions.length,
			state_root : block.stateRoot,
			receipt_root : block.receiptRoot,
			receipt_num : block.receipts.length,
			total_difficulty : block.totalDifficulty.toNumber(),
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
				value : txs[i].value.toNumber(),
				gas : txs[i].gas,
				gasprice : txs[i].gasPrice.toNumber(),
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

	// 清除大于blocknumber的数据
	function clearDB(blocknumber) {
		DB.delete("blocks", {condition:"block > "+blocknumber});
		DB.delete("transactions", {condition:"blocknumber > "+blocknumber});
		// 清除对应合约表数据
		clearContractDB(blocknumber);
	}	

	function clearContractDB(blocknumber) {
		for(var key in contractConfig) {
			//console.log(contractConfig[key].table);
			if(contractConfig[key].table.length != 0) {
				for(var i=0; i<contractConfig[key].table.length; i++) {
					//console.log(contractConfig[key].table[i]);
					DB.delete(contractConfig[key].table[i], {condition:"blocknumber > "+blocknumber});
				}
			}
		}
	}	
}	
	
	
	
	
	
	
	
	