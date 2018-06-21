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
	var stime = new Date().getTime();
	var redis = require('redis');
	var client = redis.createClient(6379,'192.168.1.131',{});
	//client.auth('mypass', redis.print);
	// if you'd like to select database 3, instead of 0 (default), call
	// client.select(3, function() { /* ... */ });

	client.on("error", function (err) {
	    console.log("Error " + err);
	    
	});

	client.set("string key", "string val", redis.print);
	client.hset("hash key", "hashtest 1", "some value", redis.print);
	client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
	client.hkeys("hash key", function (err, replies) {
	    console.log(replies.length + " replies:");
	    replies.forEach(function (reply, i) {
	        console.log("    " + i + ": " + reply);
	    });
	    client.quit();
	});


	var etime = new Date().getTime();
	console.log(' redis cost time : '+(etime-stime));
	// web3
	// var Web3 = require('web3');
	// var web3 = new Web3();
	// web3.setProvider(new web3.providers.HttpProvider("http://122.224.77.187:8545"));




}