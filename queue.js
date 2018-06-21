//多进程模块
var cluster = require('cluster');
var async = require('async');
var kue = require('kue')
, queue = kue.createQueue();
//	queue.removeOnComplete( true ).save();

var log4js = require('log4js');
var log4js_conf = require('./log4js.json');
log4js.configure(log4js_conf);
var logger = log4js.getLogger('log_date');
logger.info('server is running ');
var workers = 1;
//var workers = require('os').cpus().length;
if (cluster.isMaster) {
	kue.app.listen(8888);
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
	/*	var dbConfig = require('./config/db.js');
		var Dbobject = require('./lib/poolClient.js');
		var DB = new Dbobject(dbConfig.pooldb);
		DB.createPool();
		var Web3 = require('web3');
		var web3 = new Web3();*/
	//web3.setProvider(new web3.providers.HttpProvider("http://120.27.97.197:8545"));
	//web3.setProvider(new web3.providers.HttpProvider("http://192.168.1.11:8545"));
	queue.process('email', 10, function(job, done){
		//console.log(job);
		var pending = 5 
		, total = pending;

	var interval = setInterval(function(){
		job.log('sending!');
		console.log(job.id);
		job.progress(total - pending, total);
		--pending || done();  
		pending || clearInterval(interval); 
	}, 1000);                               
	});
}
