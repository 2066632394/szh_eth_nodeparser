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
    var DB = new Dbobject(dbConfig.pooldb_btc);
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

    var contractConfig = require('./config/contract_btc.js');
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
    var symbollist = {};

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
            //console.log('start -----'+loopStart);

        } else {
            console.log(row);
            loopStart = 1;
        }
        loopStart = 680755; 
        blockLoop();
    }	

    // // 获取数据库最大的blocknumber
    // function getLoopStartBlock1() {
    // 	var order = "block DESC";
    // 	DB.findOne("blocks", "*", callGetLoopStartBlock1, {'limit':1, 'order':order});
    // }
    // // 获取数据库最大的blocknumber回调
    // function callGetLoopStartBlock1(row) {
    // 	logger.info('start :'+new Date().toLocaleString());
    // 	if(row.length != 0 && row.block != "undefined") {
    // 		loopStart = row.block;
    // 		console.log('mysql block :'+loopStart);
    // 		blockLoop();
    // 	} else {
    // 		console.log(row);
    // 		loopStart = 0;
    // 		blockLoop();
    // 	}
    // }

    function blockLoop(){
        var topblock = web3.eth.blockNumber;// 
        //client.getAsync('block_top').then(function(topblock){
        if(topblock!='undefined'){
            topblock = Number(topblock);
        }else{
            topblock = web3.eth.blockNumber;
        }

        if(loopStart > topblock) {
            //console.log(loopStart+" is pendding!");
            setTimeout(function () {
                getLoopStartBlock();
            }, 500)
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
                //getSymbolList();
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

        var bug = 0;
        for (var j = 0; j < txs.length; j++) {			
            if(getContractAddersses().indexOf(txs[j].to) == "-1") {	
                console.log(" no contract  address in config like "+txs[j].to)
            } else {
                var coindb = getCoindb(txs[j].to);
                coindb = getCoindb(txs[j].to);
                var inputDecode = parseTxInputNew(txs[j].to, txs[j].input);
                txs[j]["func"] = inputDecode["func"];
                txs[j]["args"] = inputDecode["args"];
                var coindb = getCoindb(txs[j].to);
                if(receipts[j] != null){
                    var tx = [];
                    var tx_log = [];
                    tx['input'] = inputDecode;
                    if(tx['input']['func'] == "placeOrder"){
                        var currency = tx['input']['args'][0].substr(2);
                        currency = web3.toAscii(currency).substr(0,3);
                        var isbuy = tx['input']['args'][3];
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
                        if(receipts[j].logs[k]['event'] == "UpdateWallet"
                                || receipts[j].logs[k]['event'] == "OrderCreate"
                                || receipts[j].logs[k]['event'] == "MtfEvent"
                                || receipts[j].logs[k]['event'] == "CancelOrderEvent" 
                                || receipts[j].logs[k]['event'] == "Deposit"
                                || receipts[j].logs[k]['event'] == "Withdraw" 
                                || receipts[j].logs[k]['event'] == "SetUidEvent"
                                || receipts[j].logs[k]['event'] == "CreateSymbol" 
                                || receipts[j].logs[k]['event'] == "NewBill"
                                || receipts[j].logs[k]['event'] == "CreateCoin"){
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
                }



            }

        }
        if(bug>0){
            //return;
        }
        //console.log(log_list);
        console.log('-log_list : '+log_list.length);
        DB._pool.getConnection(function (err, connection) {
            if (err) {
                bcallback(err, null);
            }
            connection.beginTransaction(function (err) {
                if (err) {
                    bcallback(err, null);
                }
                console.log("tran---start :");

                var funcArr = [];
                log_list.forEach(function(log){

                    var temp = parseLogs(log,connection);

                    funcArr.push(temp);


                });

                /*var sql_log = function(cb){
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

                funcArr.push(sql_log);*/
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
        }else if(currency == 'BTC'){
            type = 3;
        }else if(currency == 'BTY'){
            type = 4;
        }else if(currency == 'ETC'){
            type = 5;
        }else if(currency == 'OIL'){
            type = 6;
        }else{
            type = symbollist[currency];
        }

        return type;
    }  

    function getSymbolList(){
        DB._pool.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                return;
            }
            connection.query("select id,coin from coin_list", [], function (tErr, rows, fields) {
                if (tErr) {
                    throw tErr;
                }else{
                    for(var i = 0; i < rows.length;i++){
                        symbollist[rows[i]['coin']] = rows[i]['id'];
                    }
                }
            })

        })

    }

    function parseLogs(log,connection){

        var sqlparamsEntities = [];
        if(log['event'] == "UpdateWallet"){
            var sql = []
                var sql_params = [];
            var amount = log['args']['amount'].toNumber();
            var frozen = log['args']['frozen'].toNumber();
            var currency = parseCurrency(log['args']['currency']);
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

        }else if (log['event'] == "OrderCreate"){

            var sql = [];
            var sql1 = [];
            var sql_params = [];
            var sql1_params = [];
            var priceamount;
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
            sql1['sql'] = "insert into trade_market (price,amount,currency,ty) values (?,?,?,?) ON DUPLICATE KEY UPDATE amount = amount+?";
            sql1_params.push(price);
            sql1_params.push(amount);
            sql1_params.push(currency);
            sql1_params.push(ty);
            sql1_params.push(amount);
            sql1['params'] = sql1_params;
            var temp = function(cb){
                connection.query(sql['sql'],sql['params'] , function (tErr, rows, fields) {
                    if (tErr) {						                
                        connection.rollback(function () {
                            console.log("事务失败，ERROR：" + tErr);
                            throw tErr;						                  
                        });
                    }else{
                        connection.query("insert into trade_market (price,amount,currency,ty) values (?,?,?,?) ON DUPLICATE KEY UPDATE amount = amount+?",[price,amount,currency,ty,amount] , function (tErr1, rows1, fields1) {
                            if (tErr1) {
                                connection.rollback(function () {
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

        }else if (log['event'] == "MtfEvent"){

            var offerIdwantId = log['args']['offerIdwantId'];
            var priceamount = log['args']['priceamount'];
            var mtfId = log['args']['mtfId'].toNumber();
            web3.toBigNumber(log['args']['priceamount']);
            var n128 = web3.toBigNumber(2).pow(128);
            var offerid = log['args']['offerIdwantId'].divToInt(n128).toNumber();
            var wantedid = log['args']['offerIdwantId'].mod(n128).toNumber();
            var price = log['args']['priceamount'].divToInt(n128).toNumber();
            var amount = log['args']['priceamount'].mod(n128).toNumber();
            var sql = [];
            var sql_params = [mtfId,offerid,wantedid,price,amount,log['args']['timestamp'],new Date().getTime(),log['args']['from']];
            sql['sql'] = "insert into trade_matches (id,active_id,passive_id,price,amount,matchtime,addtime,active_owner) values (?,?,?,?,?,?,?,?)";
            sql['params'] = sql_params;
            var temp = function(cb){
                connection.query("insert into trade_matches (id,active_id,passive_id,price,amount,matchtime,addtime,active_owner) values (?,?,?,?,?,?,?,?) ", sql_params, function (tErr, rows, fields) {
                    if (tErr) {
                        connection.rollback(function () {
                            console.log("事务失败，，ERROR：" + tErr);
                            throw tErr;

                        });
                    }else{
                        connection.query("select id,type,price,symbol from trade_order where id in(?,?) ", [offerid,wantedid], function (tErr2, rows2, fields2) {
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
                                }else if(rows2[i]['type'] == 1){
                                    bprice = rows2[i]['price'];
                                    if(rows2[i]['id'] == offerid){
                                        active_type = 1;
                                    }
                                }
                            }
                            if(sprice < bprice && active_type == 0){
                                cprice = bprice;
                            }else{
                                cprice = sprice;	
                            }
                            cost = (cprice*amount)/100000000/100000000;
                            connection.query("update trade_market set amount = amount-? where price = ? and ty = 0",[amount,sprice] , function (tErr3, rows3, fields3) {
                                if (tErr3) {
                                    connection.rollback(function () {
                                        console.log("事务失败1，ERROR：" + tErr3);
                                        throw tErr3;

                                    });
                                }else{
                                    connection.query("update trade_market set amount = amount-? where price = ? and ty = 1",[amount,bprice] , function (tErr5, rows5, fields5) {
                                        if (tErr5) {
                                            connection.rollback(function () {
                                                console.log("事务失败5，ERROR：" + tErr5);
                                                throw tErr5;

                                            });
                                        }else{
                                            connection.query("update trade_order set unmatch = unmatch -? ,update_time = ? ,cost = cost+ ? where id in (?,?)", [amount,log['args']['timestamp'],cost,offerid,wantedid], function (tErr1, rows1, fields1) {
                                                if (tErr1) {
                                                    connection.rollback(function () {
                                                        console.log("事务失败，，ERROR：" + tErr1);
                                                        throw tErr1;

                                                    });
                                                }
                                                connection.query("update trade_matches set cost_price = ?,type= ?,symbol = ? where id = ?", [cprice,active_type,active_symbol,mtfId], function (tErr4, rows4, fields4) {
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
            var oid = log['args']['id'].toNumber();
            var sql = [];
            var sql_params = [amount,oid];
            sql['sql'] = "update trade_order set  amount= amount+?,cancelamount = cancelamount+? where id = ?";
            sql['params'] = sql_params;
            var sql1 = [];
            var sql_params1 = [oid];
            sql1['sql'] = "update trade_market set  amount= amount+?,cancelamount = cancelamount+? where id = ?";
            sql1['params'] = sql_params1;
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
                                if(rows1.length>0){
                                    connection.query("update trade_market set amount = amount-? where price=? and currency = ? and ty= ?",[amount,price,rows1[0]['symbol'],rows1[0]['type']] , function (tErr2, rows2, fields2) {
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

        }else if(log['event'] == "Deposit"){
            var sql = [];
            var sql_params = [];
            var amount = log['args']['amount'].toNumber();
            var currency = parseCurrency(log['args']['currency']);
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
        }else if(log['event'] == "Withdraw"){
            var sql = [];
            var sql_params = [];
            var amount = log['args']['amount'].toNumber();
            var currency = parseCurrency(log['args']['currency']);
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
        }else if(log['event'] == "SetUidEvent"){

            var sql_params = [];
            var fr = log['args']['from'];
            var uid = log['args']['uid'].toNumber();
            var sql = "insert into trade_uid values (?,?,?)";
            console.log('fr :'+fr+" uid :"+uid);
            var temp = function(cb){
                connection.query(sql, [uid,fr,0], function (tErr, rows, fields) {
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

        }else if(log['event'] == "ResetAccount"){
            //帐号重置	
        }else if(log['event'] == "NewBill"){
            var sql = [];
            var sql_params = [];
            var address = log['args']['borrower'];
            var hash = log['transactionHash'];
            var billId = log['args']['billId'].toNumber();
            var rmb = 0;
            var bill = 0;
            var unit = 0;
            var stime = 0;
            var etime = 0;
            var amount = 0;
            sql['sql'] = "insert into bill_list (bill_id,hash,address,bill,origin_bill,rmb,origin_rmb,unit,unsellcount,totalcount,starttime,endtime,addtime,updatetime,status) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ";
            sql_params.push(billId);
            sql_params.push(hash);
            sql_params.push(address);
            sql_params.push(bill);
            sql_params.push(bill);
            sql_params.push(rmb);
            sql_params.push(rmb);
            sql_params.push(unit);
            sql_params.push(amount);
            sql_params.push(amount);
            sql_params.push(stime);
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
                        cb(null,"ok");
                    }
                })
            }
        }else if(log['event'] == "CreateSymbol"){

            var sql_params = [];
            var fr = log['args']['from'];
            var currency = log['args']['name'];
            currency = currency.substr(2);
            var symbol = web3.toAscii(currency);
            var first = symbol.substr(0,3);
            var second = symbol.substr(3);
            var sql = "insert into symbol_list (first,second,symbol) values (?,?,?) ";

            var temp = function(cb){
                connection.query(sql, [first,second,symbol], function (tErr, rows, fields) {
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

        }else if(log['event'] == "CreateCoin"){

            var sql_params = [];
            var fr = log['args']['from'];
            var currency = log['args']['name'];
            var coin = parseCurrency(currency);
            var id = log['args']['id'].toNumber();
            var sql = "INSERT INTO coin_list (id,coin) values (?,?) ";

            var temp = function(cb){
                connection.query(sql, [id,coin], function (tErr, rows, fields) {
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
            //console.log(contractAdderss);
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
