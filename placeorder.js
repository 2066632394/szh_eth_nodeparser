// 多进程模块cluster
var cluster = require('cluster');
var async = require('async');
var log4js = require('log4js');
var log4js_conf = require('./log4js.json');
log4js.configure(log4js_conf);
var logger = log4js.getLogger('log_date');
logger.info('server is running ');
var dbConfig = require('./config/db.js');
var Dbobject = require('./lib/poolClient.js');
var DB = new Dbobject(dbConfig.pooldb);
DB.createPool();
var NewCoin = require('./Coin.js');
var contractAddress = '0x1d58f5ce187ac3687c0cfa8cdfccd5506454facd';
var address = "0x4291fe7908b557932b1e42e3ae44e55a1c231fc5";
var key = '48a0ecfec485af1ea35527b28b077106e8dfdb689da2a72fabec6312bc9a7177';
NewCoin.init();
$nonce = NewCoin.getNonce(address);
console.log($nonce);

NewCoin.placeOrder(key, 'OILCNY', 10, 10, true); 

