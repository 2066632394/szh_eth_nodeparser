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
	var DB = new Dbobject(dbConfig.pooldb3);
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
	web3.setProvider(new web3.providers.HttpProvider("http://192.168.1.11:8545"));
	// 合约地址配置
	
	var contractConfig = require('./config/contract_test.js');
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
		//logger.info('start :'+new Date().toLocaleString());
		//console.log(JSON.stringify(row));
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
			//console.log('top :'+topblock);
			
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
				arr = [649200,649201,649202,649203,649204,649205,649206,649207,649208];
				console.log(arr);
				async.eachSeries(arr,function(item,callback){
						//console.log('block : '+item);
						//console.log(item);
						var stime = new Date().getTime();
/*
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
									console.log(649204);
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
										console.log(item+"----- time----"+(etime-etim)+"---------get-------"+(etim-stime));
										callback(null,block);
									});
									
									
								})

							//}
						//})
						
					},function(err){
						console.log('err :'+err);
						//logger.info('end : '+new Date().toLocaleString());
						getLoopStartBlock();
					}

				);
			}
		//})

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

		for (var j = 0; j < txs.length; j++) {			
			if(getContractAddersses().indexOf(txs[j].to) == "-1") {	
				console.log(" no contract  address in config like "+txs[j].to)
			} else {
				//var inputDecode = parseTxInput2(coindb,txs[j].to, txs[j].input);
				var inputDecode = parseTxInputNew(txs[j].to, txs[j].input);
				txs[j]["func"] = inputDecode["func"];
				txs[j]["args"] = inputDecode["args"];
				
				var coindb = getCoindb(txs[j].to);

				if(receipts[j] != null){
					var tx = []
					var tx_log = [];
					//tx['txindex'] = j;
					tx['input'] = inputDecode;
					if(tx['input']['func'] == "placeOrder"){
						var currency = tx['input']['args'][0].substr(2);
						currency = web3.toAscii(currency).substr(0,3);
						var isbuy = tx['input']['args'][3];
						//console.log("is_buy : "+isbuy);
						var ty = 0;
						if(isbuy){
							ty = 1;
						}
					}
					for (var k = 0; k < receipts[j].logs.length; k++) {	
						coindb.decodeLog(receipts[j].logs[k]);
						var args = receipts[j].logs[k]['args'];
						args['timestamp'] = timestamp;
						if(receipts[j].logs[k]['event'] == "OrderCreate"){
							args['type'] = currency;
							args['ty'] = ty;
						}
						//receipts[j].logs[k]['txindex'] = j;
						if(receipts[j].logs[k]['event'] == "UpdateWallet"
							|| receipts[j].logs[k]['event'] == "OrderCreate"
							|| receipts[j].logs[k]['event'] == "MtfEvent"
							|| receipts[j].logs[k]['event'] == "CancelOrderEvent" 
							|| receipts[j].logs[k]['event'] == "Deposit"
							|| receipts[j].logs[k]['event'] == "Withdraw" ){
							log_list.push(receipts[j].logs[k]);
						
						}
					}
				}else{
					console.log('re is null');	
				}

				

			}

		}
		console.log('-----end------'+log_list.length);
/*			var funcArr = [];
                                log_list.forEach(function(log){

                                        var temp = parseLogs1(log,null);

                                        funcArr.push(temp);


                                });*/
		console.log(funcArr.length);
		return;


		DB._pool.getConnection(function (err, connection) {
	        if (err) {
	            callback(err, null);
	        }
	        connection.beginTransaction(function (err) {
	            if (err) {
	                callback(err, null);
	            }
	            //console.log("tran---");

				var funcArr = [];
				log_list.forEach(function(log){
					
					var temp = parseLogs1(log,connection);

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
				console.log(funcArr[0].toString());
				console.log(funcArr[funcArr.length-1].toString());
				//console.log("block log length : "+funcArr.length);
	            async.series(funcArr, function (err, result) {
	                //console.log("transaction error: " + err);
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
	                            connection.release();
	                            bcallback(null, info);
	                        }
	                    })
	                }
	            })


	        });
	    })



		// ==========new==================
		// async.eachSeries(log_list,function(log,result){

		// 	parseLogs(log,function(lerr,lresult){
		// 		if(lerr){
		// 			result(lerr,result);
		// 		}else{
		// 			console.log('next start');
		// 			result(null,log);
		// 		}
		// 	})

		// },function(err){
		// 	if(err){
		// 		console.log('each log :' +err);
		// 	}
		// 	bcallback(null,"ok");
		// })


		// console.log(log_list);
		// var fallArr = [];
		// log_list.forEach(function(list){

		// })
		// async.waterfall([
		//     function(cb) {
		//      console.log('1.2.1: ', 'start'); 
		//      cb(null, 3); 
		//  	},
		//     function(n, cb) { 
		//     	console.log('1.2.2: ', n); 
		//     	var n = 4;
		//     	cb(null, n); 
		//     },
		//     function(n, cb) { 
		//     	console.log('1.2.3: ', n); 
		//     	var n=5;
		//     	cb(null, n); 
		//     },
		//     function(n, cb) { 
		//     	console.log('1.2.4: ', n);
		//     	 cb(n, cb); 
		//     } 
		// ], function (err, result) {
		//     console.log('err: ', err); // -> myerr
		//     console.log('result: ', result); // -> undefined
		// });
		//==========old==================
		// async.eachSeries(tx_list,function(tx,result){
			
		// 	DB._pool.getConnection(function (err, connection) {
		//         if (err) {
		//             return result(err, null);
		//         }
		//         connection.beginTransaction(function (err) {
		//             if (err) {
		//                 return result(err, null);
		//             }
		//             console.log("开始执行transaction");

		//             // ty 0 buy 1 sell 
		// 			var type = 0;
		// 			console.log("func-------------------------------------------------------------"+tx['input']['func']);
		// 			if(tx['input']['func'] == "placeOrder"){
		// 				var currency = tx['input']['args'][0].substr(2);
		// 				currency = web3.toAscii(currency).substr(0,6);
		// 				var isbuy = tx['input'][3];
		// 				var ty = 0;
		// 				if(isbuy){
		// 					ty = 0;
		// 					type = getCurrencyType(currency.substr(0,3));
		// 				}else{
		// 					ty = 1;
		// 					type = getCurrencyType(currency.substr(3));
		// 				}
						
		// 			}

		// 			if(!isEmptyObject(tx)){
		// 				var log_list = [];
		// 				for (var i = 0; i < tx['loglist'].length; i++) {
		// 					log_list.push(tx['loglist'][i]);
		// 				}
		// 				//console.log(log_list);
		// 				if(!isEmptyObject(log_list)){
		// 					var addr = "";
		// 					//var type = "0"; 
		// 					var funcArr = [];
		// 					log_list.forEach(function(log){
		// 						var sql_list = [];
		// 						var sql_arr = [];
		// 						var sql_param = [];

		// 						if (log['event'] == 'OrderCreate'){
		// 							var priceamount
		// 							if(log['args']['pirceamount'] != "undefined"){
		// 								priceamount = log['args']['pirceamount'];
		// 							}else{
		// 								priceamount = log['args']['priceamount'];
		// 							}
									
		// 							var price = priceamount/(Math.pow(2,128));
		// 							var amount = priceamount&(Math.pow(2,128)-1);
		// 							var offerid = (log['args']['offerId']/10000)*10000;
		// 							addr = log['args']['from'];
		// 							//if(amount>0){
		// 								sql_arr['sql'] =  "insert into trade_order (id,type,symbol,price,amount,unmatch,cancelamount,addtime,update_time ) values (?,?,?,?,?,?,?,?,?) ";
		// 								sql_param.push(offerid);
		// 								sql_param.push(ty);
		// 								sql_param.push(type);
		// 								sql_param.push(price);
		// 								sql_param.push(amount);
		// 								sql_param.push(amount);
		// 								sql_param.push(0);
		// 								sql_param.push(log['args']['timestamp']);
		// 								sql_param.push(new Date().getTime());
		// 								sql_arr['params'] = sql_param;
		// 								sql_list.push(sql_arr);
		// 								var temp = function(cb){
		// 									connection.query(sql_arr['sql'],sql_arr['params'] , function (tErr, rows, fields) {
		// 				                        if (tErr) {						                
		// 				                            connection.rollback(function () {
		// 				                                console.log("事务失败，ERROR：" + tErr);
		// 				                                throw tErr;						                  
		// 				                            });
		// 				                        }else{
		// 				                        	console.log(JSON.stringify(rows)+"+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
		// 				                        	//cb(null,'ok');
		// 				                        	connection.query("insert into trade_market (price,amount,currency,ty) values (?,?,?,?) ON DUPLICATE KEY UPDATE amount = amount+?",[price,amount,type,ty,amount] , function (tErr1, rows1, fields1) {
		// 						                    //connection.query("insert into user (name,content) values (?,?)",['1231','2312313'] , function (tErr1, rows1, fields1) {  
		// 						                        if (tErr1) {
		// 						                            connection.rollback(function () {
		// 						                            	console.log(rows);
		// 						                                console.log("事务失败1，ERROR：" + tErr1);
		// 						                                throw tErr1;
								                                
		// 						                            });
		// 						                        }else{
		// 						                        	cb(null,'ok');
		// 						                        }
		// 						                    })
		// 				                        }
		// 				                    })											
		// 								}
		// 								funcArr.push(temp);

		// 							//}
									
		// 						}else if(log['event'] == 'CancelEvent'){
		// 							var priceamount
		// 							if(log['args']['pirceamount'] != "undefined"){
		// 								priceamount = log['args']['pirceamount'];
		// 							}else{
		// 								priceamount = log['args']['priceamount'];
		// 							}
									
		// 							var price = priceamount/(Math.pow(2,128));
		// 							var amount = priceamount&(Math.pow(2,128)-1);

		// 							//if(amount>0){
		// 								var temp = function(cb){
		// 									connection.query("update trade_order set  amount= amount+?,cancelamount = cancelamount+? where id = ?",[amount,amount,log['args']['offerId']] , function (tErr, rows, fields) {
		// 					                        if (tErr) {
		// 					                            connection.rollback(function () {
		// 					                                console.log("事务失败，，ERROR：" + tErr);
		// 					                                throw tErr;
							                              
		// 					                            });
		// 					                        }else{
		// 					                        	connection.query("select type,symbol from  trade_order where id = ?",[log['args']['offerId']] , function (tErr1, rows1, fields1) {
		// 							                        if (tErr1) {
		// 							                            connection.rollback(function () {
		// 							                                console.log("事务失败 ，ERROR：" + tErr1);
		// 							                                throw tErr1;
									                                
		// 							                            });
		// 							                        }else{
		// 							                        	if(rows1.length>0){
		// 							                      			connection.query("update trade_market set amount = amount+? where price=? and symbol = ? and type= ?",[amount,price,rows[0]['symbol'],rows[0]['type']] , function (tErr2, rows2, fields2) {
		// 										                        if (tErr2) {
		// 										                            connection.rollback(function () {
		// 										                                console.log("事务失败，，ERROR：" + tErr2);
		// 										                                throw tErr2;
												                                
		// 										                            });
		// 										                        }else{
		// 										                        	cb(null,"ok");
		// 										                        }
		// 										                    })
		// 							                        	}

		// 							                        }
		// 							                    })
		// 					                        }
		// 					                })											
		// 								}
		// 								funcArr.push(temp);

		// 							//}

		// 						}else if (log['event'] == 'UpdateWallet'){
		// 							var amount = log['args']['amount'].toNumber();
		// 							var frozen = log['args']['frozen'].toNumber();
		// 							var currency = parseCurrency(log['args']['currency'])
		// 							currency = getCurrencyType(currency);
		// 							var temp = function(cb){
		// 								connection.query("insert into trade_accounts (addr,currency,active,frozen,addtime,update_time) values (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE active = active+? ,frozen = frozen + ? ,update_time =? ",[log['args']['addr'],currency,amount,frozen,log['args']['timestamp'],new Date().getTime(),amount,frozen,new Date().getTime()] , function (tErr, rows, fields) {
		// 			                        if (tErr) {
		// 			                            connection.rollback(function () {
		// 			                                console.log("事务失败，，ERROR：" + tErr);
		// 			                                throw tErr;
		// 			                            });
		// 			                        }else{
		// 			                        	cb(null,"ok");
		// 			                        }
		// 			                    })
		// 							}
		// 							funcArr.push(temp);
	

		// 						}else if (log['event'] == 'MtfEvent'){
		// 							//console.log(log);
		// 							var offerIdwantId = log['args']['offerIdwantId'];
		// 							var priceamount = log['args']['priceamount'];
		// 							var mtfId = (log['args']['mtfId']/100)*100;

		// 							var offerid = offerIdwantId/(Math.pow(2,128));
		// 							var wantedid = offerIdwantId&(Math.pow(2,128)-1);

		// 							var price = priceamount/(Math.pow(2,128));
		// 							var amount = priceamount&(Math.pow(2,128)-1);
		// 							//console.log(mtfId+"---------------"+price+"----------------"+amount);
		// 							var temp = function(cb){
		// 								connection.query("insert into trade_matches (id,active_id,passive_id,price,amount,matchtime,addtime) values (?,?,?,?,?,?,?) ",[mtfId,offerid,wantedid,price,amount,log['args']['timestamp'],new Date().getTime()] , function (tErr, rows, fields) {
		// 			                        if (tErr) {
		// 			                            connection.rollback(function () {
		// 			                                console.log("事务失败，，ERROR：" + tErr);
		// 			                                throw tErr;
					                               
		// 			                            });
		// 			                        }else{
		// 			                        	cb(null,"ok");
		// 			                        }
		// 			                    })	
		// 							}
		// 							funcArr.push(temp);


		// 						}



		// 						console.log(log['event']);
		// 					})
		// 		            async.series(funcArr, function (err, result1) {
		// 		                console.log("transaction error: " + err);
		// 		                if (err) {
		// 		                    connection.rollback(function (err) {
		// 		                        console.log("transaction error: " + err);
		// 		                        connection.release();
		// 		                        console.log('result :'+result1);
		// 		                        result(err, null);
		// 		                    });
		// 		                } else {
		// 		                    connection.commit(function (err, info) {
		// 		                        console.log("transaction info: " + JSON.stringify(info));
		// 		                        if (err) {
		// 		                            console.log("执行事务失败，" + err);
		// 		                            connection.rollback(function (err) {
		// 		                                console.log("transaction error: " + err);
		// 		                                connection.release();
		// 		                                result(err, null);
		// 		                            });
		// 		                        } else {
		// 		                            connection.release();
		// 		                            result(null, info);
		// 		                            console.log('result :'+result1);
		// 		                        }
		// 		                    })
		// 		                }
		// 		            })

							
		// 				}

		// 			}

		//         });
		//     })



		// },function(err){
		// 	if(err){
		// 		console.log('error is : '+err);
		// 	}else{
		// 		console.log(" ok ");
		// 	}
		// })
		//  ==========old==================
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
		}
		return type;
	}

	function parseLogs1(log,connection){

  		var sqlparamsEntities = [];
  		//var funcArr = [];
        if(log['event'] == "UpdateWallet"){
        	var sql = []
        	var sql_params = [];
			var amount = log['args']['amount'].toNumber();
			var frozen = log['args']['frozen'].toNumber();
			var currency = parseCurrency(log['args']['currency'])
			currency = getCurrencyType(currency);
			sql['sql'] = "insert into trade_accounts (addr,currency,active,frozen,addtime,update_time) values (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE active = active+? ,frozen = frozen + ? ,update_time =? ";
			sql_params.push(log['args']['addr']);
			sql_params.push(currency);
			sql_params.push(amount);
			sql_params.push(frozen);
			sql_params.push(log['args']['timestamp']);
			sql_params.push(new Date().getTime());
			sql_params.push(amount);
			sql_params.push(frozen);
			sql_params.push(new Date().getTime());
			sql['params'] = sql_params;
			sqlparamsEntities.push(sql);

			var temp = function(cb){
				connection.query("insert into trade_accounts (addr,currency,active,frozen,addtime,update_time) values (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE active = active+? ,frozen = frozen + ? ,update_time =? ", sql_params, function (tErr, rows, fields) {
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
			//funcArr.push(temp);

		}else if (log['event'] == "OrderCreate"){

			var sql = [];
			var sql1 = [];
        	var sql_params = [];
        	var sql1_params = [];
			var priceamount
			if(log['args']['pirceamount'] != "undefined"){
				priceamount = log['args']['pirceamount'];
			}else{
				priceamount = log['args']['priceamount'];
			}
			var n128 = web3.toBigNumber(2).pow(128);
			var price = log['args']['pirceamount'].divToInt(n128).toNumber();
			var amount = log['args']['pirceamount'].mod(n128).toNumber();

			var offerid = log['args']['offerId'].toNumber();
			addr = log['args']['from'];
			var currency = getCurrencyType(log['args']['type']);
			var ty = log['args']['ty'];
			sql['sql'] =  "insert into trade_order (id,owner,type,symbol,price,amount,unmatch,cancelamount,addtime,update_time ,insert_time) values (?,?,?,?,?,?,?,?,?,?,?) ";
			//console.log("offid : "+offerid);
			sql_params.push(offerid);
			sql_params.push(log['args']['from']);
			sql_params.push(ty);
			sql_params.push(currency);
			sql_params.push(price);
			sql_params.push(amount);
			sql_params.push(amount);
			sql_params.push(0);
			sql_params.push(log['args']['timestamp']);
			sql_params.push(log['args']['timestamp']);
			sql_params.push(new Date().getTime());
			sql['params'] = sql_params;
			sqlparamsEntities.push(sql);
			sql1['sql'] = "insert into trade_market (price,amount,currency,ty) values (?,?,?,?) ON DUPLICATE KEY UPDATE amount = amount+?";
			sql1_params.push(price);
			sql1_params.push(amount);
			sql1_params.push(currency);
			sql1_params.push(ty);
			sql1_params.push(amount);
			sql1['params'] = sql1_params;
			sqlparamsEntities.push(sql1);


			var temp = function(cb){
				connection.query(sql['sql'],sql['params'] , function (tErr, rows, fields) {
                    if (tErr) {						                
                        connection.rollback(function () {
                            console.log("事务失败，ERROR：" + tErr);
                            throw tErr;						                  
                        });
                    }else{
                    	connection.query("insert into trade_market (price,amount,currency,ty) values (?,?,?,?) ON DUPLICATE KEY UPDATE amount = amount+?",[price,amount,currency,ty,amount] , function (tErr1, rows1, fields1) {
	                    //connection.query("insert into user (name,content) values (?,?)",['1231','2312313'] , function (tErr1, rows1, fields1) {  
	                        if (tErr1) {
	                            connection.rollback(function () {
	                            	//console.log(rows);
	                                console.log("事务失败1，ERROR：" + tErr1);
	                                throw tErr1;
	                                
	                            });
	                        }else{
	                        	cb(null,'ok');
	                        }
	                    })
                    }
                })											
			}
			//funcArr.push(temp);




		}else if (log['event'] == "MtfEvent"){

			var offerIdwantId = log['args']['offerIdwantId'];
			var priceamount = log['args']['priceamount'];
			var mtfId = log['args']['mtfId'].toNumber();
			web3.toBigNumber(log['args']['priceamount']);
			//console.log("amount : "+log['args']['priceamount']+"offerid");
			// var offerid = offerIdwantId/(Math.pow(2,128));
			// var wantedid = offerIdwantId&(Math.pow(2,128)-1);
			var n128 = web3.toBigNumber(2).pow(128);
			var offerid = log['args']['offerIdwantId'].divToInt(n128).toNumber();
			var wantedid = log['args']['offerIdwantId'].mod(n128).toNumber();
			
			var price = log['args']['priceamount'].divToInt(n128).toNumber();
			var amount = log['args']['priceamount'].mod(n128).toNumber();
			// var price = priceamount/(Math.pow(2,128));
			// var amount = priceamount&(Math.pow(2,128)-1);
			//console.log(mtfId+"---------------"+price+"----------------"+amount);
			var sql = [];
			var sql_params = [mtfId,offerid,wantedid,price,amount,log['args']['timestamp'],new Date().getTime(),log['args']['from']];
			sql['sql'] = "insert into trade_matches (id,active_id,passive_id,price,amount,matchtime,addtime,active_owner) values (?,?,?,?,?,?,?,?)";
			sql['params'] = sql_params;
			sqlparamsEntities.push(sql);


			var temp = function(cb){
				connection.query("insert into trade_matches (id,active_id,passive_id,price,amount,matchtime,addtime,active_owner) values (?,?,?,?,?,?,?,?) ", sql_params, function (tErr, rows, fields) {
                    if (tErr) {
                        connection.rollback(function () {
                            console.log("事务失败，，ERROR：" + tErr);
                            throw tErr;
                           
                        });
                    }else{
                    	
                    	connection.query("select id,type,price,symbol from trade_order where id in(?,?) ", [offerid,wantedid], function (tErr2, rows2, fields2) {
					sqlparamsEntities.push(sql);
		                    if (tErr2) {
		                        connection.rollback(function () {
		                            console.log("事务失败，，ERROR：" + tErr2);
		                            throw tErr2;
		                           
		                        });
		                    }
		                    var sprice = 0;//出售价格
		                    var bprice = 0;//买入价格
				    var cprice = 0;//deal price
		                    var cost = 0;
		                    var active_type = 0; //判断主动单是BUY SELL
		                    var active_symbol = rows2[0]['symbol'];
		                    for (var i = 0; i < rows2.length; i++) {
		                    	if(rows2[i]['type'] == 0){
		                    		sprice = rows2[i]['price'];
		                    		//cost = (sprice*amount)/100000000/100000000;
		                    	}else if(rows2[i]['type'] == 1){
		                    		bprice = rows2[i]['price'];
		                    		if(rows2[i]['id'] == offerid){
			                    		active_type = 1;
			                    	}
		                    	}

		                    	//console.log('=============='+rows2[i]['id']);
		                    }
				    if(sprice < bprice && active_type == 0){
					cprice = bprice;
				    }else{
					cprice = sprice;	
				    }
				    cost = (cprice*amount)/100000000/100000000;
		                    //console.log('row legth : '+rows2.length+"----------------amount :"+amount+'mtfid :'+mtfId+'offerid : '+offerid+"wantedid : "+wantedid+'sprice :'+sprice+" bprice : "+bprice+" type : "+active_type);
	                    	connection.query("update trade_market set amount = amount-? where price = ? and ty = 0",[amount,sprice] , function (tErr3, rows3, fields3) {
					sqlparamsEntities.push(sql);
		                    //connection.query("insert into user (name,content) values (?,?)",['1231','2312313'] , function (tErr1, rows1, fields1) {  
		                        if (tErr3) {
		                            connection.rollback(function () {
		                            	//console.log(rows);
		                                console.log("事务失败1，ERROR：" + tErr3);
		                                throw tErr3;
		                                
		                            });
		                        }else{
		                        	connection.query("update trade_market set amount = amount-? where price = ? and ty = 1",[amount,bprice] , function (tErr5, rows5, fields5) {
							sqlparamsEntities.push(sql);
		                        		if (tErr5) {
				                            connection.rollback(function () {
				                            	//console.log(rows);
				                                console.log("事务失败5，ERROR：" + tErr5);
				                                throw tErr5;
				                                
				                            });
				                        }else{
				                        	connection.query("update trade_order set unmatch = unmatch -? ,update_time = ? ,cost = cost+ ? where id in (?,?)", [amount,log['args']['timestamp'],cost,offerid,wantedid], function (tErr1, rows1, fields1) {
											sqlparamsEntities.push(sql);
								                    if (tErr1) {
								                        connection.rollback(function () {
								                            console.log("事务失败，，ERROR：" + tErr1);
								                            throw tErr1;
								                           
								                        });
								                    }
								                	connection.query("update trade_matches set cost_price = ?,type= ?,symbol = ? where id = ?", [cprice,active_type,active_symbol,mtfId], function (tErr4, rows4, fields4) {
											sqlparamsEntities.push(sql);
										                    if (tErr4) {
										                        connection.rollback(function () {
										                            console.log("事务失败，，ERROR：" + tErr4);
										                            throw tErr4;
										                           
										                        });
										                    }
										                    
										                    cb(null,'ok');
									                })
							                })

				                        }
		                        	})

                				}

		                    })	
                    	})
                    }
                })	
			}
			//funcArr.push(temp);

		}else if(log['event'] == "CancelOrderEvent"){

			var priceamount
			if(log['args']['pirceamount'] != "undefined"){
				priceamount = log['args']['pirceamount'];
			}else{
				priceamount = log['args']['priceamount'];
			}
			
			var n128 = web3.toBigNumber(2).pow(128);
			var price = log['args']['priceamount'].divToInt(n128).toNumber();
			var amount = log['args']['priceamount'].mod(n128).toNumber();
			//console.log("cancel amount : "+amount +"--"+price +log['args']['priceamount']);
			var oid = log['args']['id'].toNumber();
			var sql = [];
			var sql_params = [amount,oid];
			sql['sql'] = "update trade_order set  amount= amount+?,cancelamount = cancelamount+? where id = ?";
			sql['params'] = sql_params;
			sqlparamsEntities.push(sql);
			var sql1 = [];
			var sql_params1 = [oid];
			sql1['sql'] = "update trade_market set  amount= amount+?,cancelamount = cancelamount+? where id = ?";
			sql1['params'] = sql_params1;
			sqlparamsEntities.push(sql1);
			
			var temp = function(cb){
				connection.query("update trade_order set  cancelamount = cancelamount+? where id = ?",sql_params, function (tErr, rows, fields) {
                        if (tErr) {
                            connection.rollback(function () {
                                console.log("事务失败，，ERROR：" + tErr);
                                throw tErr;
                              
                            });
                        }else{
                        	connection.query("select type,symbol from  trade_order where id = ?",sql_params1 , function (tErr1, rows1, fields1) {
		                        if (tErr1) {
		                            connection.rollback(function () {
		                                console.log("事务失败 ，ERROR：" + tErr1);
		                                throw tErr1;
		                                
		                            });
		                        }else{
		                        	//console.log("fields1"+fields1);
		                        	//console.log("rows1"+JSON.stringify(rows1));
		                        	if(rows1.length>0){
		                      			connection.query("update trade_market set amount = amount-? where price=? and currency = ? and ty= ?",[amount,price,rows1[0]['symbol'],rows1[0]['type']] , function (tErr2, rows2, fields2) {
								sqlparamsEntities.push(sql);
					                        if (tErr2) {
					                            connection.rollback(function () {
					                                console.log("事务失败，，ERROR：" + tErr2);
					                                throw tErr2;
					                                
					                            });
					                        }else{
					                        	cb(null,"ok");
					                        }
					                    })
		                        	}else{
		                        		cb(null,"ok");
		                        	}

		                        }
		                    })
                        }
                })											
			}
			//funcArr.push(temp);



		}else if(log['event'] == "Deposit"){
			var sql = []
        	var sql_params = [];
			var amount = log['args']['amount'].toNumber();
			var currency = parseCurrency(log['args']['currency'])
			currency = getCurrencyType(currency);
			sql['sql'] = "insert into trade_accounts (addr,currency,active,frozen,addtime,update_time) values (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE active = active+? ,frozen = frozen + ? ,update_time =? ";
			sql_params.push(log['args']['addr']);
			sql_params.push(currency);
			sql_params.push(amount);
			sql_params.push(0);
			sql_params.push(log['args']['timestamp']);
			sql_params.push(new Date().getTime());
			sql_params.push(amount);
			sql_params.push(0);
			sql_params.push(new Date().getTime());
			sql['params'] = sql_params;
			sqlparamsEntities.push(sql);


			var temp = function(cb){
				connection.query(sql['sql'], sql_params, function (tErr, rows, fields) {
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
			//funcArr.push(temp);
		}else if(log['event'] == "Withdraw"){
			var sql = []
        	var sql_params = [];
			var amount = log['args']['amount'].toNumber();
			var currency = parseCurrency(log['args']['currency'])
			currency = getCurrencyType(currency);
			sql['sql'] = "insert into trade_accounts (addr,currency,active,frozen,addtime,update_time) values (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE active = active-? ,frozen = frozen + ? ,update_time =? ";
			sql_params.push(log['args']['addr']);
			sql_params.push(currency);
			sql_params.push(amount);
			sql_params.push(0);
			sql_params.push(log['args']['timestamp']);
			sql_params.push(new Date().getTime());
			sql_params.push(amount);
			sql_params.push(0);
			sql_params.push(new Date().getTime());
			sql['params'] = sql_params;
			sqlparamsEntities.push(sql);

			var temp = function(cb){
				connection.query(sql['sql'], sql_params, function (tErr, rows, fields) {
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

        return temp;
//return sqlparamsEntities

	}

	function parseLogs(log,callback){
		console.log(log.blockNumber+"----"+log['txindex']+"----"+log['logIndex']);
		console.log('event : '+log['event']);
	    DB._pool.getConnection(function (err, connection) {
	        if (err) {
	            callback(err, null);
	        }
	        connection.beginTransaction(function (err) {
	            if (err) {
	                callback(err, null);
	            }
	            console.log("开始执行transaction");

          		var sqlparamsEntities = [];
          		var funcArr = [];
	            if(log['event'] == "UpdateWallet"){
	            	var sql = []
	            	var sql_params = [];
					var amount = log['args']['amount'].toNumber();
					var frozen = log['args']['frozen'].toNumber();
					var currency = parseCurrency(log['args']['currency'])
					currency = getCurrencyType(currency);
					sql['sql'] = "insert into trade_accounts (addr,currency,active,frozen,addtime,update_time) values (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE active = active+? ,frozen = frozen + ? ,update_time =? ";
					sql_params.push(log['args']['addr']);
					sql_params.push(currency);
					sql_params.push(amount);
					sql_params.push(frozen);
					sql_params.push(log['args']['timestamp']);
					sql_params.push(new Date().getTime());
					sql_params.push(amount);
					sql_params.push(frozen);
					sql_params.push(new Date().getTime());
					sql['params'] = sql_params;
					sqlparamsEntities.push(sql);

					var temp = function(cb){
						connection.query("insert into trade_accounts (addr,currency,active,frozen,addtime,update_time) values (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE active = active+? ,frozen = frozen + ? ,update_time =? ", sql_params, function (tErr, rows, fields) {
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
					funcArr.push(temp);

				}else if (log['event'] == "OrderCreate"){

					var sql = [];
					var sql1 = [];
	            	var sql_params = [];
	            	var sql1_params = [];
					var priceamount
					if(log['args']['pirceamount'] != "undefined"){
						priceamount = log['args']['pirceamount'];
					}else{
						priceamount = log['args']['priceamount'];
					}
					var n128 = web3.toBigNumber(2).pow(128);
					var price = log['args']['pirceamount'].divToInt(n128).toNumber();
					var amount = log['args']['pirceamount'].mod(n128).toNumber();

					var offerid = (log['args']['offerId']/10000)*10000;
					addr = log['args']['from'];
					var currency = getCurrencyType(log['args']['type']);
					var ty = log['args']['ty'];
					sql['sql'] =  "insert into trade_order (id,type,symbol,price,amount,unmatch,cancelamount,addtime,update_time ) values (?,?,?,?,?,?,?,?,?) ";
					//console.log("offid : "+offerid);
					sql_params.push(offerid);
					sql_params.push(ty);
					sql_params.push(currency);
					sql_params.push(price);
					sql_params.push(amount);
					sql_params.push(amount);
					sql_params.push(0);
					sql_params.push(log['args']['timestamp']);
					sql_params.push(new Date().getTime());
					sql['params'] = sql_params;
					sqlparamsEntities.push(sql);
					sql1['sql'] = "insert into trade_market (price,amount,currency,ty) values (?,?,?,?) ON DUPLICATE KEY UPDATE amount = amount+?";
					sql1_params.push(price);
					sql1_params.push(amount);
					sql1_params.push(currency);
					sql1_params.push(ty);
					sql1_params.push(amount);
					sql1['params'] = sql1_params;
					sqlparamsEntities.push(sql1);


					var temp = function(cb){
						connection.query(sql['sql'],sql['params'] , function (tErr, rows, fields) {
	                        if (tErr) {						                
	                            connection.rollback(function () {
	                                console.log("事务失败，ERROR：" + tErr);
	                                throw tErr;						                  
	                            });
	                        }else{
	                        	connection.query("insert into trade_market (price,amount,currency,ty) values (?,?,?,?) ON DUPLICATE KEY UPDATE amount = amount+?",[price,amount,currency,ty,amount] , function (tErr1, rows1, fields1) {
			                    //connection.query("insert into user (name,content) values (?,?)",['1231','2312313'] , function (tErr1, rows1, fields1) {  
			                        if (tErr1) {
			                            connection.rollback(function () {
			                            	console.log(rows);
			                                console.log("事务失败1，ERROR：" + tErr1);
			                                throw tErr1;
			                                
			                            });
			                        }else{
			                        	cb(null,'ok');
			                        }
			                    })
	                        }
	                    })											
					}
					funcArr.push(temp);




				}else if (log['event'] == "MtfEvent"){

					var offerIdwantId = log['args']['offerIdwantId'];
					var priceamount = log['args']['priceamount'];
					var mtfId = (log['args']['mtfId']/100)*100;
					web3.toBigNumber(log['args']['priceamount']);
					console.log("amount : "+log['args']['priceamount']+"offerid");
					// var offerid = offerIdwantId/(Math.pow(2,128));
					// var wantedid = offerIdwantId&(Math.pow(2,128)-1);
					var n128 = web3.toBigNumber(2).pow(128);
					var offerid = log['args']['offerIdwantId'].divToInt(n128).toNumber();
					var wantedid = log['args']['offerIdwantId'].mod(n128).toNumber();
					
					var price = log['args']['priceamount'].divToInt(n128).toNumber();
					var amount = log['args']['priceamount'].mod(n128).toNumber();
					// var price = priceamount/(Math.pow(2,128));
					// var amount = priceamount&(Math.pow(2,128)-1);
					//console.log(mtfId+"---------------"+price+"----------------"+amount);
					var sql = [];
					var sql_params = [mtfId,offerid,wantedid,price,amount,log['args']['timestamp'],new Date().getTime()];
					sql['sql'] = "insert into trade_matches (id,active_id,passive_id,price,amount,matchtime,addtime) values (?,?,?,?,?,?,?)";
					sql['params'] = sql_params;
					sqlparamsEntities.push(sql);


					var temp = function(cb){
						connection.query("insert into trade_matches (id,active_id,passive_id,price,amount,matchtime,addtime) values (?,?,?,?,?,?,?) ", sql_params, function (tErr, rows, fields) {
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
					funcArr.push(temp);

				}else if(log['event'] == "CancelOrderEvent"){

					var priceamount
					if(log['args']['pirceamount'] != "undefined"){
						priceamount = log['args']['pirceamount'];
					}else{
						priceamount = log['args']['priceamount'];
					}
					
					var n128 = web3.toBigNumber(2).pow(128);
					var price = log['args']['priceamount'].divToInt(n128).toNumber();
					var amount = log['args']['priceamount'].mod(n128).toNumber();
					console.log("cancel amount : "+amount +"--"+price +log['args']['priceamount']);
					var sql = [];
					var sql_params = [amount,amount,log['args']['offerId']];
					sql['sql'] = "update trade_order set  amount= amount+?,cancelamount = cancelamount+? where id = ?";
					sql['params'] = sql_params;
					sqlparamsEntities.push(sql);
					var sql1 = [];
					var sql_params1 = [log['args']['offerId']];
					sql1['sql'] = "update trade_market set  amount= amount+?,cancelamount = cancelamount+? where id = ?";
					sql1['params'] = sql_params1;
					sqlparamsEntities.push(sql1);
					
					var temp = function(cb){
						connection.query("update trade_order set  amount= amount+?,cancelamount = cancelamount+? where id = ?",sql_params, function (tErr, rows, fields) {
		                        if (tErr) {
		                            connection.rollback(function () {
		                                console.log("事务失败，，ERROR：" + tErr);
		                                throw tErr;
		                              
		                            });
		                        }else{
		                        	connection.query("select type,symbol from  trade_order where id = ?",sql_params1 , function (tErr1, rows1, fields1) {
				                        if (tErr1) {
				                            connection.rollback(function () {
				                                console.log("事务失败 ，ERROR：" + tErr1);
				                                throw tErr1;
				                                
				                            });
				                        }else{
				                        	console.log("fields1"+fields1);
				                        	if(rows1.length>0){
				                      			connection.query("update trade_market set amount = amount+? where price=? and symbol = ? and type= ?",[amount,price,rows[0]['symbol'],rows[0]['type']] , function (tErr2, rows2, fields2) {
							                        if (tErr2) {
							                            connection.rollback(function () {
							                                console.log("事务失败，，ERROR：" + tErr2);
							                                throw tErr2;
							                                
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
					funcArr.push(temp);



				}else if(log['event'] == "Deposit"){
					var sql = []
	            	var sql_params = [];
					var amount = log['args']['amount'].toNumber();
					var currency = parseCurrency(log['args']['currency'])
					currency = getCurrencyType(currency);
					sql['sql'] = "insert into trade_accounts (addr,currency,active,frozen,addtime,update_time) values (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE active = active+? ,frozen = frozen + ? ,update_time =? ";
					sql_params.push(log['args']['addr']);
					sql_params.push(currency);
					sql_params.push(amount);
					sql_params.push(0);
					sql_params.push(log['args']['timestamp']);
					sql_params.push(new Date().getTime());
					sql_params.push(amount);
					sql_params.push(0);
					sql_params.push(new Date().getTime());
					sql['params'] = sql_params;
					sqlparamsEntities.push(sql);


					var temp = function(cb){
						connection.query(sql['sql'], sql_params, function (tErr, rows, fields) {
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
					funcArr.push(temp);
				}else if(log['event'] == "Withdraw"){
					var sql = []
	            	var sql_params = [];
					var amount = log['args']['amount'].toNumber();
					var currency = parseCurrency(log['args']['currency'])
					currency = getCurrencyType(currency);
					sql['sql'] = "insert into trade_accounts (addr,currency,active,frozen,addtime,update_time) values (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE active = active+? ,frozen = frozen + ? ,update_time =? ";
					sql_params.push(log['args']['addr']);
					sql_params.push(currency);
					sql_params.push(amount);
					sql_params.push(0);
					sql_params.push(log['args']['timestamp']);
					sql_params.push(new Date().getTime());
					sql_params.push(amount);
					sql_params.push(0);
					sql_params.push(new Date().getTime());
					sql['params'] = sql_params;
					sqlparamsEntities.push(sql);

				}


				var sql_log_arr = [];
				var sql_params_log = [];
				sql_log_arr['sql'] = "insert into trade_update_log (blocknumber,txindex,logindex,addtime) values (?,?,?,?)";
				sql_params_log.push(log['blockNumber']);
				sql_params_log.push(log['txindex']);
				sql_params_log.push(log['logIndex']);
				sql_params_log.push(new Date().getTime());
				sql_log_arr['params'] = sql_params_log;
				sqlparamsEntities.push(sql_log_arr);

				var sql_log = function(cb){
					connection.query(sql_log_arr['sql'] , sql_params_log, function (tErr, rows, fields) {
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
				funcArr.push(sql_log);

	            async.series(funcArr, function (err, result) {
	                console.log("transaction error: " + err);
	                if (err) {
	                    connection.rollback(function (err) {
	                        console.log("transaction error: " + err);
	                        connection.release();
	                        callback(err, null);
	                    });
	                } else {
	                    connection.commit(function (err, info) {
	                        console.log("transaction info: " + JSON.stringify(info));
	                        if (err) {
	                            console.log("执行事务失败，" + err);
	                            connection.rollback(function (err) {
	                                console.log("transaction error: " + err);
	                                connection.release();
	                                callback(err, null);
	                            });
	                        } else {
	                            connection.release();
	                            callback(null, info);
	                        }
	                    })
	                }
	            })
	        });
	    });



		//callback(null,"ok");

	}



	function parseUpdateWallet(log,callback){
		//var sql_list = [];
		var args = log['args'];
		var currency = parseCurrency(args['currency']);

		var type = 0;
		if(currency == 'CNY'){
			type = 1;
		}else if(currency == 'ETH'){
			type = 2;
		}else if(currency == 'ETC'){
			type = 3;
		}
		DB.findOne("trade_accounts","addr",function(result,params){
			var sql_list = [];
			var sql_arr = [];
			var sql_params = [];
			var localTime = new Date().getTime();
			//console.log("addr :"+isEmptyObject(result));
			if(!isEmptyObject(result)){
				sql_arr['sql'] = 'update trade_accounts set active = active + ?, frozen = frozen+?,update_time = ? where addr = ? and currency = ?';
				sql_params.push(args['amount'].toNumber());
				sql_params.push(args['frozen'].toNumber());
				sql_params.push(localTime);
				sql_params.push(args['addr']);
				sql_params.push(type);
				sql_arr['params'] = sql_params;
				sql_list.push(sql_arr);
				//console.log("sql_arr :"+JSON.stringify(sql_list));
			}else{
				sql_arr['sql'] = "insert into trade_accounts (addr,currency,active,frozen,addtime,update_time) values (?,?,?,?,?,?)";
				sql_params.push(args['addr']);
				sql_params.push(type);
				sql_params.push(args['amount'].toNumber());
				sql_params.push(args['frozen'].toNumber());
				sql_params.push(args['timestamp']);
				sql_params.push(localTime);
				sql_arr['params'] = sql_params;
				//sql_arr['params'] = [args['addr'],type,args['amount'],args['frozen'],args['timestamp'],localTime];
			};
			if(!isEmptyObject(sql_arr)){// 最小点记录

				var sql_log_arr = [];
				var sql_params_log = [];
				sql_log_arr['sql'] = "insert into trade_update_log (blocknumber,txindex,logindex,addtime) values (?,?,?,?)";
				sql_params_log.push(log['blockNumber']);
				sql_params_log.push(log['txindex']);
				sql_params_log.push(log['logIndex']);
				sql_params_log.push(new Date().getTime());
				sql_log_arr['params'] = sql_params_log;
				sql_list.push(sql_log_arr);
			}
			sql_list.push(sql_arr)
			
			//callback(null,sql_arr);
			DB.execTrans(sql_list,function(err,result){
				if(err){
					//console.log("transactions fail");
					callback('transactions fail',args);
				}else{
					console.log("transaction succ");
					//logger.info(log['blockNumber']+"--"+log['txindex']+"--"+log['logIndex']);
					callback(null,"ok");

				}
			})
		},{"condition":"addr="+"'"+args['addr']+"'"+" AND currency = "+type});

	}

	function paraseOrderCreate(log,callback){
		var args = log['args'];
		var offerId = log['args']['offerId'];
		var priceamount = log['args']['pirceamount'];
		var price = priceamount/(Math.pow(2,128));
		var amount = priceamount&(Math.pow(2,128)-1);
		var sql_list = [];
		var sql_log_arr = [];
		var sql_params_log = [];
		sql_log_arr['sql'] = "insert into trade_update_log (blocknumber,txindex,logindex,addtime) values (?,?,?,?)";
		sql_params_log.push(log['blockNumber']);
		sql_params_log.push(log['txindex']);
		sql_params_log.push(log['logIndex']);
		sql_params_log.push(new Date().getTime());
		sql_log_arr['params'] = sql_params_log;
		sql_list.push(sql_log_arr);

		sql_list.push(sql_list);
		
		//callback(null,sql_arr);
		DB.execTrans(sql_list,function(err,result){
			if(err){
				//console.log("transactions fail");
				callback('transactions fail',args);
			}else{
				callback(null,args);
				console.log("transaction succ");
			}
		})
	}

	function parseMtfEvent(log,callback){
		var args = log['args'];		
		var sql_list = [];
		var sql_log_arr = [];
		var sql_params_log = [];
		sql_log_arr['sql'] = "insert into trade_update_log (blocknumber,txindex,logindex,addtime) values (?,?,?,?)";
		sql_params_log.push(log['blockNumber']);
		sql_params_log.push(log['txindex']);
		sql_params_log.push(log['logIndex']);
		sql_params_log.push(new Date().getTime());
		sql_log_arr['params'] = sql_params_log;
		sql_list.push(sql_log_arr);

		sql_list.push(sql_list);
		
		//callback(null,sql_arr);
		DB.execTrans(sql_list,function(err,result){
			if(err){
				//console.log("transactions fail");
				callback('transactions fail',args);
			}else{
				callback(null,args);
				console.log("transaction succ");
			}
		})		
	}

	function paraseCancelCreate(log,callback){
		var args = log['args'];		
		var sql_list = [];
		var sql_log_arr = [];
		var sql_params_log = [];
		sql_log_arr['sql'] = "insert into trade_update_log (blocknumber,txindex,logindex,addtime) values (?,?,?,?)";
		sql_params_log.push(log['blockNumber']);
		sql_params_log.push(log['txindex']);
		sql_params_log.push(log['logIndex']);
		sql_params_log.push(new Date().getTime());
		sql_log_arr['params'] = sql_params_log;
		sql_list.push(sql_log_arr);

		sql_list.push(sql_list);
		
		//callback(null,sql_arr);
		DB.execTrans(sql_list,function(err,result){
			if(err){
				//console.log("transactions fail");
				callback('transactions fail',args);
			}else{
				callback(null,args);
				console.log("transaction succ");
			}
		})		
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

	
}		
