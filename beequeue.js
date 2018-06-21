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
        var bluebird = require('bluebird');
        var redis = require('redis');
        bluebird.promisifyAll(redis.RedisClient.prototype);
        bluebird.promisifyAll(redis.Multi.prototype);
        var client = redis.createClient();
        client.auth('Fuzamei7799',redis.print);
        client.on('error',function(err){
                console.log('error on '+err);
                client.quit();
        })
        var Web3 = require('web3');
        var web3 = new Web3();
        //web3.setProvider(new web3.providers.HttpProvider("http://120.27.97.197:8545"));
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

        run();

        function run() {
                console.log('start select in mysql');
                client.getAsync('block_top').then(function(res){
                        console.log('res : '+res);
                        var start = 1;
                        if(res != null){
                                start = Number(res) +1 ;
                                startImport(start);
                        }else{
                                client.setAsync(['block_top','0']).then(function(result){
                                        if(!result){
                                                console.log('set init start err ');
                                        }
                                        startImport(start);
                                })
                        }
                        //console.log('start : '+start);
                        //startImport(start);
                        /*client.getsetAsync(['block_update',start]).then(function(res){
                                if(res) {
                                        console.log('update succ');
                                }else{
                                        console.log('update fail');
                                }
                        })*/
                })

                //DB.findOne('trade_update_log','*',loopBack,{'limit':1,'order':'blocknumber desc'});
                //var number = web3.eth.blockNumber;
                //var job = queue.reateJob({blocknumber:number}).save();

        };




        function startImport(start) {

                var top = web3.eth.blockNumber;

                if(start > top){
                        console.log('no new block is waiting!');
                        run();
                }else{
                        var list = [];
                        for(var i = start;i<top+1;i++){
                                list.push(i);
                        }
                        async.eachSeries(list,function(item,callback){
                                console.log('item :'+item);
                                web3.eth.getBlock(item,true,function(err,block){
                                        if(err){
                                                console.log('err is '+err);
                                                callback(err,item);
                                        }

                                        client.hexists(['block',item],function(err,rep){
                                                console.log('block exists rep : '+rep);
                                                if(err){console.log('err:'+err);callback(err,item)};
                                                if(rep == 0)    {
                                                        client.hset('block',item,JSON.stringify(block),function(err,reply){
                                                                console.log(reply.toString());
                                                                if(err){
                                                                        console.log('err is '+err);
                                                                        callback(err,item);
                                                                }
                                                                
                                                                client.getsetAsync(['block_top',item]).then(function(res){
                                                                         if(res) {
                                                                                console.log('update succ');
                                                                                callback(null,item);
                                                                         }else{ 
                                                                                console.log('update fail');
                                                                                callback('err',item);
                                                                         }
                                                                 })

                                                               
                                                               // callback(null,item);
                                                        });
                                                }else{
                                                        callback(null,item);
                                                }
                                        })


                                })
                        },function(error){
                                if(error){
                                        console.log(error);
                                }
                                run();
                        })

                }



        }




        function loopBack(row){
                console.log('row:'+JSON.stringify(row));
                if(row.length != 0 && row.blocknumber != 'undefined'){
                        var top = web3.eth.blockNumber;
                        var list = [];
                        var start = row.blocknumber+1;
                        for(var i=start; i< top+1; i++){
                                list.push(i);
                        }


                        console.log('list :'+list);

                        async.eachSeries(list,function(item,callback){
                                console.log('item:'+item);
                                web3.eth.getBlock(item,true,function(err,block){
                                        //console.log('get block : '+JSON.stringify(block));            
                                        if(err){
                                                console.log('err is :'+err);
                                                callback(err,item);
                                        }
                                        //queue.createJob({blocknumber:item,block:block}).save();                                       
                                        client.hexists(['block',item],function(err,rep){
                                                console.log('rep : '+rep);
                                                if(err){console.log('err:'+err);callback(err,item)};
                                                if(rep == 0)    {
                                                        client.hset('block',item,block.toString(),function(err,reply){
                                                                console.log(reply.toString());
                                                                if(err){
                                                                        console.log('err is '+err);
                                                                        callback(err,item);
                                                                }
                                                                callback(null,item);
                                                        });
                                                }else{
                                                        callback(null,item);
                                                }
                                        })
                                })
                        },function(error){
                                if(error){
                                        console.log('error : '+error);
                                }
                                run();
                        })

                }else{
                        run();
                }
        }

}
