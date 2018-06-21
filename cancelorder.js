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

    var NewCoin = require('./Coin.js');
    


}
