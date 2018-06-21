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

	  var client = redis.createClient(6379,'114.55.178.27',{});
	  client.auth('Fuzamei7799',redis.print);

	  client.on('error',function(err){
	  console.log('error on '+err);
	  client.quit();
	  });
	  */

	// web3
	var Web3 = require('web3');
	var web3 = new Web3();
	//web3.setProvider(new web3.providers.HttpProvider("http://122.224.124.250:8545"));
	web3.setProvider(new web3.providers.HttpProvider("http://eth.bityuan.com:80"));
	// 合约地址配置

	var contractConfig = require('./config/contract_eth_new.js');
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

	var loopStart; //= 657420;
	var clearNum;// 清除数据库blocknumber
	var step = 0;


	getLoopStartBlock();

	// 获取数据库最大的blocknumber
	function getLoopStartBlock() {
		var order = "blocknumber DESC";
		DB.findOne("trade_update_log", "*", callGetLoopStartBlock, {'limit':1, 'order':order});
	}
	// 获取数据库最大的blocknumber回调
	function callGetLoopStartBlock(row) {
		if(row.length != 0 && row.blocknumber != "undefined") {
			loopStart = row.blocknumber+1;//row.block-step;
			console.log('start -----'+loopStart);
		} else {
			console.log(row);
			loopStart = 1;
		}
		blockLoop();
	}	

	function blockLoop(){
		var topblock = web3.eth.blockNumber;// 
		//client.getAsync('block_top').then(function(topblock){
		if(topblock!='undefined'){
			topblock = Number(topblock);
		}else{
			topblock = web3.eth.blockNumber;
		}

		if(loopStart > topblock) {
			console.log(loopStart+" is pendding!");
			setTimeout(function () {
				getLoopStartBlock();
			}, 500)
			//return;
		}else{
			var limit = topblock-loopStart+1;
			if(limit >100){
				limit = 100;
			}
			var loopEnd = loopStart+limit;
			var arr = [];
			for (var i = loopStart; i < loopEnd ; i++) {
				arr.push(i);
			}
			//console.log(arr);
			//return;
			async.eachSeries(arr,function(item,callback){
				//console.log('block : '+item);
				//console.log(item);
				/*var stime = new Date().getTime();

				  client.hgetAsync(['block1',item]).then(function(resblock){
				  var etim = new Date().getTime();
				  resblock = JSON.parse(resblock);
				  if(resblock){
				  parseBlock(resblock, function(berr,bresult){
				  if(berr){
				  console.log(berr);
				  callback(berr,resblock);
				  }

				  var etime = new Date().getTime();
				//console.log(item+"--------redis parse time -----------------"+(etime-etim)+"---------get time ----------------"+(etim-stime));
				callback(null,resblock);
				});

				}else{*/
				//console.log("----------------"+(stime));
				web3.eth.getBlock(item,true,function(err,block){
					if(err)	{
						console.log(err);
						console.log(item+" is pendding!");
						callback(err,item);
					}
					var etim = new Date().getTime();
					parseBlock(block, function(berr,bresult){
						if(berr){
							console.log(berr);
							callback(berr,block);
						}

						var etime = new Date().getTime();
						//console.log(item+"----- time----"+(etime-etim)+"---------get-------"+(etim-stime));
						callback(null,block);
					});


				})

				//}
				//})

			},function(err){
				console.log('err :'+err);
				getLoopStartBlock();
			}

			);
		}


	}


	// 解析区块
	function parseBlock(block,bcallback) {
		//console.log('-----start------');
		var txs = block.transactions;
		var receipts = block.receipts;
		var timestamp = block.timestamp;
		var number = block.number;
		var log_list = [];

		// 暂时考虑一个块里只有一个合约地址
		var contractAdderss = '';
		for (var j = 0; j < txs.length; j++) {			
			if(getContractAddersses().indexOf(txs[j].to) == "-1") {	
			} else {
				contractAdderss = txs[j].to;
			}

		}
		//console.log(contractAdderss);
		if(contractAdderss.substr(0,2) == '0x'){
			var coindb = getCoindb(contractAdderss);
		}
		console.log('n : '+number+" txl :"+txs.length);
		var bug = 0;
		for (var j = 0; j < txs.length; j++) {			
			if(getContractAddersses().indexOf(txs[j].to) == "-1") {	
				console.log(" no contract  "+txs[j].to)
			} else {
				var inputDecode = parseTxInputNew(txs[j].to, txs[j].input);
				txs[j]["func"] = inputDecode["func"];
				txs[j]["args"] = inputDecode["args"];
				if(inputDecode["func"] == "setFeeRate" && inputDecode["args"][0] != "undefined"){
					setFeeRate(inputDecode["args"][0].toNumber());
				}
				var coindb = getCoindb(txs[j].to);

				if(receipts[j] != null){
					var tx = [];
					var tx_log = [];
					tx['input'] = inputDecode;

					for (var k = 0; k < receipts[j].logs.length; k++) {	
						coindb.decodeLog(receipts[j].logs[k]);
						var args = receipts[j].logs[k]['args'];
						args['timestamp'] = timestamp;
						if(receipts[j].logs[k]['event'] == "NewBill"
								|| receipts[j].logs[k]['event'] == "InvestorDeposit"
								|| receipts[j].logs[k]['event'] == "InvestorWithdraw"
								|| receipts[j].logs[k]['event'] == "Invest" 
								|| receipts[j].logs[k]['event'] == "Deposit"
								|| receipts[j].logs[k]['event'] == "Withdraw" 
								|| receipts[j].logs[k]['event'] == "InvestProfit"
								|| receipts[j].logs[k]['event'] == "CloseBill" ){
									log_list.push(receipts[j].logs[k]);
								}
					}
				}else{
					bug++;
					console.log('re is null=======================================');
					console.log('receipts'+JSON.stringify(receipts));
					console.log('transaction'+JSON.stringify(txs));
					console.log('block'+JSON.stringify(block));	
					bcallback('receipt is null',null);
					//break;
				}



			}

		}
		if(bug>0){
			//return;
		}
		console.log('-log_list : '+log_list.length);
		DB._pool.getConnection(function (err, connection) {
			if (err) {
				callback(err, null);
			}
			connection.beginTransaction(function (err) {
				if (err) {
					callback(err, null);
				}
				console.log("tran---start :");
				var funcArr = [];
				log_list.forEach(function(log){
					var temp = parseLogs(log,connection);
					funcArr.push(temp);
				});

				var sql_log = function(cb){
					connection.query("insert into trade_update_log set blocknumber = ?,addtime = ?"  , [number,new Date().getTime()], function (tErr, rows, fields) {
						if (tErr) {
							connection.rollback(function () {
								console.log("事务失败，，ERROR：" + tErr);
								throw tErr;
							});
						}else{
							cb(null,"ok");
						}
					})	
				};

				funcArr.push(sql_log);
				console.log("block log length : "+funcArr.length);
				async.series(funcArr, function (err, result) {
					console.log("tran-- " + err);
					if (err) {
						connection.rollback(function (err) {
							console.log("transaction error: " + err);
							connection.release();
							bcallback(err, null);
						});
					} else {
						connection.commit(function (err, info) {
							//console.log("transaction info: " + JSON.stringify(info));
							if (err) {
								console.log("执行事务失败，" + err);
								connection.rollback(function (err) {
									console.log("transaction error: " + err);
									connection.release();
									bcallback(err, null);
								});
							} else {
								console.log('commit --succ');
								connection.release();
								bcallback(null, info);
							}
						})
					}
				})


			});
		})

	}

	function getCurrencyType(currency){
		var type = 0;
		if(currency == 'CNY'){
			type = 1;
		}else if(currency == 'ETH'){
			type = 2;
		}else if(currency == 'ETC'){
			type = 3;
		}else if(currency == 'OIL'){
			type = 4;
		}else if(currency == 'BTC'){
			type = 5;
		}
		return type;
	}

	function setFeeRate(fee){
		var data = {
			name : "fee",
			value : fee
		};
		DB.replaceInto("bill_config",data);
	}

	function parseLogs(log,connection){

		if(log['event'] == "InvestorDeposit"){
			var sql = [];
			var sql_params = [];
			var address = log['args']['address'];
			var hash = log['transactionHash'];
			var rmb = log['args']['rmb'].toNumber();
			var currency = 1;
			var type = 1;
			var trade_type = 0;
			sql['sql'] = "insert into trade_accounts (addr,currency,type,active,frozen,addtime,update_time) values (?,?,?,?,?,?,、) ON DUPLICATE KEY UPDATE active = active+? ,frozen = frozen + ? ,update_time =? ";
			sql_params.push(address);
			sql_params.push(currency);
			sql_params.push(type);
			sql_params.push(rmb);
			sql_params.push(0);
			sql_params.push(log['args']['timestamp']);
			sql_params.push(new Date().getTime());
			sql_params.push(rmb);
			sql_params.push(0);
			sql_params.push(new Date().getTime());

			var temp = function(cb){
				connection.query(sql['sql'], sql_params, function (tErr, rows, fields) {
					if (tErr) {
						connection.rollback(function () {
							console.log("事务失败，，ERROR：" + tErr);
							throw tErr;
						});
					}else{
						connection.query("INSERT INTO bill_rmb_log (txhash,address,rmb,trade_type,type,addtime)", [hash,address,rmb,trade_type,type], function (tErr, rows, fields) {
							if (tErr) {
								connection.rollback(function () {
									console.log("事务失败，，ERROR：" + tErr);
									throw tErr;
								});
							}else{
								cb(null,"ok");
							}
						})
					}
				})
			}

		}else if (log['event'] == "InvestorWithdraw"){

			var sql = [];
			var sql_params = [];
			var address = log['args']['address'];
			var hash = log['transactionHash'];
			var rmb = log['args']['rmb'].toNumber();
			var currency = 1;
			var type = 1;//investor
			var trade_type = 1;//出金
			sql['sql'] = "insert into trade_accounts (addr,currency,type,active,frozen,addtime,update_time) values (?,?,?,?,?,?,、) ON DUPLICATE KEY UPDATE active = active-? ,frozen = frozen + ? ,update_time =? ";
			sql_params.push(address);
			sql_params.push(currency);
			sql_params.push(type);
			sql_params.push(rmb);
			sql_params.push(0);
			sql_params.push(log['args']['timestamp']);
			sql_params.push(new Date().getTime());
			sql_params.push(rmb);
			sql_params.push(0);
			sql_params.push(new Date().getTime());

			var temp = function(cb){
				connection.query(sql['sql'], sql_params, function (tErr, rows, fields) {
					if (tErr) {
						connection.rollback(function () {
							console.log("事务失败，，ERROR：" + tErr);
							throw tErr;
						});
					}else{
						connection.query("INSERT INTO bill_rmb_log (txhash,address,rmb,trade_type,type,addtime)", [hash,address,rmb,trade_type,type], function (tErr, rows, fields) {
							if (tErr) {
								connection.rollback(function () {
									console.log("事务失败，，ERROR：" + tErr);
									throw tErr;
								});
							}else{
								cb(null,"ok");
							}
						})
					}
				})
			}

		}else if (log['event'] == "Deposit"){

			var sql = [];
			var sql_params = [];
			var address = log['args']['address'];
			var hash = log['transactionHash'];
			var rmb = log['args']['rmb'].toNumber();
			var currency = 1;
			var type = 0;
			var trade_type = 0;
			sql['sql'] = "insert into trade_accounts (addr,currency,type,active,frozen,addtime,update_time) values (?,?,?,?,?,?,、) ON DUPLICATE KEY UPDATE active = active+? ,frozen = frozen + ? ,update_time =? ";
			sql_params.push(address);
			sql_params.push(currency);
			sql_params.push(type);
			sql_params.push(rmb);
			sql_params.push(0);
			sql_params.push(log['args']['timestamp']);
			sql_params.push(new Date().getTime());
			sql_params.push(rmb);
			sql_params.push(0);
			sql_params.push(new Date().getTime());

			var temp = function(cb){
				connection.query(sql['sql'], sql_params, function (tErr, rows, fields) {
					if (tErr) {
						connection.rollback(function () {
							console.log("事务失败，，ERROR：" + tErr);
							throw tErr;
						});
					}else{
						connection.query("INSERT INTO bill_rmb_log (txhash,address,rmb,trade_type,type,addtime)", [hash,address,rmb,trade_type,type], function (tErr, rows, fields) {
							if (tErr) {
								connection.rollback(function () {
									console.log("事务失败，，ERROR：" + tErr);
									throw tErr;
								});
							}else{
								cb(null,"ok");
							}
						})
					}
				})
			}

		}else if(log['event'] == "Withdraw"){

			var sql = [];
			var sql_params = [];
			var address = log['args']['address'];
			var hash = log['transactionHash'];
			var rmb = log['args']['rmb'].toNumber();
			var currency = 1;
			var type = 0;//investor
			var trade_type = 1;//出金
			sql['sql'] = "insert into trade_accounts (addr,currency,type,active,frozen,addtime,update_time) values (?,?,?,?,?,?,、) ON DUPLICATE KEY UPDATE active = active-? ,frozen = frozen + ? ,update_time =? ";
			sql_params.push(address);
			sql_params.push(currency);
			sql_params.push(type);
			sql_params.push(rmb);
			sql_params.push(0);
			sql_params.push(log['args']['timestamp']);
			sql_params.push(new Date().getTime());
			sql_params.push(rmb);
			sql_params.push(0);
			sql_params.push(new Date().getTime());

			var temp = function(cb){
				connection.query(sql['sql'], sql_params, function (tErr, rows, fields) {
					if (tErr) {
						connection.rollback(function () {
							console.log("事务失败，，ERROR：" + tErr);
							throw tErr;
						});
					}else{
						connection.query("INSERT INTO bill_rmb_log (txhash,address,rmb,trade_type,type,addtime)", [hash,address,rmb,trade_type,type], function (tErr, rows, fields) {
							if (tErr) {
								connection.rollback(function () {
									console.log("事务失败，，ERROR：" + tErr);
									throw tErr;
								});
							}else{
								cb(null,"ok");
							}
						})
					}
				})
			}

		}else if(log['event'] == "Invest"){


			var sql = [];
			var sql_params = [];
			var hash = log['transactionHash'];
			var address = log['args']['investor'];
			var billId = log['args']['billId'].toNumber();
			var num = log['args']['num'].toNumber();
			var t = log['args']['timestamp'].toNumber();
			sql['sql'] = "INSERT INTO bill_invest_list (address,bill_id,num,addtime) values (address,billId,num,t)";
			sql_params.push(address);
			sql_params.push(billId);
			sql_params.push(num);
			sql_params.push(t);
			var temp = function(cb){
				connection.query(sql['sql'], sql_params, function (tErr, rows, fields) {
					if (tErr) {
						connection.rollback(function () {
							console.log("事务失败，，ERROR：" + tErr);
							throw tErr;
						});
					}else{
						connection.query("INSERT INTO bill_invest_log (txhash,address,bill_id,num,addtime)", [hash,address,bill_id,num,t], function (tErr, rows, fields) {
							if (tErr) {
								connection.rollback(function () {
									console.log("事务失败，，ERROR：" + tErr);
									throw tErr;
								});
							}else{
								connection.query("SELECT origin_bill,address,uint,unsellcount,totalcount FROM  bill_list WHERE bill_id = ? and status = ? limit 1", [address,bill_id,0], function (tErr, rows, fields) {
									if (tErr) {
										connection.rollback(function () {
											console.log("事务失败，，ERROR：" + tErr);
											throw tErr;
										});
									}else{
										var unit = rows[0]['uint'];
										var unsellcount = rows[0]['unsellcount'];
										var totalcount = rows[0]['totalcount'];
										var obill = rows[0]['origin_bill'];
										var costbill = 0;
										var costrmb = 0;

										costbill = num * (obill/totalcount);
										costrmb = num * uint;
										if(unsellcount > 0){
											connection.query("UPDATE invest_list set bill = bill-?,unsellcount = unsellcount-?, where bill_id = ?", [hash,address,rmb,trade_type,type], function (tErr, rows, fields) {
												if (tErr) {
													connection.rollback(function () {
														console.log("事务失败，，ERROR：" + tErr);
														throw tErr;
													});
												}else{
													cb(null,"ok");
												}
											})
										}
									}
								})
							}
						})
					}
				})
			}

		}else if(log['event'] == "CloseBill"){
			var sql = [];
			var sql_params = [];
			var address = log['args']['borrower'];
			var hash = log['args']['transactionHash'];
			var billId = log['args']['billId'].toNumber();
			sql['sql'] ="SELECT origin_bill,totalcount,uint,FROM bill_list HWERE bill_id = ? and status = 0";
			sql_params.push(billId);
			connection.query(sql['sql'], sql_params, function (tErr, rows, fields) {
				if (tErr) {
					connection.rollback(function () {
						console.log("事务失败，，ERROR：" + tErr);
						throw tErr;
					});
				}else{
					var row = rows[0];
				}
			})			
		}else if(log['event'] == "NewBill"){
			var sql = [];
			var sql_params = [];
			var address = log['args']['borrower'];
			var hash = log['args']['transactionHash'];
			var billId = log['args']['billId'].toNumber();
			var rmb = log['args']['rmb'].toNumber();
			var bill = log['args']['bill'].toNumber();
			var unit = log['args']['unit'].toNumber();
			var stime = log['args']['starttime'].toNumber();
			var etime = log['args']['etime'].toNumber();
			var currency = 1;
			var amount = rmb/unit;
			sql['sql'] = "insert into bill_list (bill_id,address,bill,origin_bill,rmb,origin_rmb,unit,unsellcount,totalcount,starttime,endtime,addtime,updatetime,status) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";
			sql_params.push(1);
			sql_params.push(address);
			sql_params.push(bill);
			sql_params.push(bill);
			sql_params.push(rmb);
			sql_params.push(rmb);
			sql_params.push(unit);
			sql_params.push(amount);
			sql_params.push(amount);
			sql_params.push(stime;
			sql_params.push(etime);
			sql_params.push(log['args']['timestamp']);
			sql_params.push(new Date().getTime());
			sql_params.push(0);

			var temp = function(cb){
				connection.query(sql['sql'], sql_params, function (tErr, rows, fields) {
					if (tErr) {
						connection.rollback(function () {
							console.log("事务失败，，ERROR：" + tErr);
							throw tErr;
						});
					}else{
						connection.query("insert into bill_new_log (txhash,bill_id,address,bill,rmb,unit,starttime,endtime) values (?,?,?,?,?,?,?,?) ", [hash,address,bill,rmb,unit,stime,etime], function (tErr, rows, fields) {
							if (tErr) {
								connection.rollback(function () {
									console.log("事务失败，，ERROR：" + tErr);
									throw tErr;
								});
							}else{
								cb(null,"ok");
							}
						})
					}
				})
			}
		}else if(log['event'] == "InvestProfit"){

		}

		return temp;


	}

			



				



	function parseCurrency(currency){
		var str = currency.substr(2);
		var currency = web3.toAscii(str);
		currency = currency.substr(0,3);
		return currency;
	}

	function Trim(str){ 
		return str.replace(/(^\s*)|(\s*$)/g, ""); 
	}


	function isEmptyObject(e) {  
		var t;  
		for (t in e)  
			return !1;  
		return !0  
	}  
	// 解析交易的input
	function parseTxInput(contractAdderss, input) {
		//var p3 = new Date().getTime();
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
		//var p4 = new Date().getTime();
		//console.log("parse tx input-----------------"+(p4-p3));
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
        if(getContractAddersses().indexOf(contractAdderss) == "-1"){
            return [];
        }else{
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
		    return inputDecode;
        }
	}


}		