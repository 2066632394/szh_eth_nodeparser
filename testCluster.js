var http = require("http");
var cluster = require("cluster");
var numCPUs = require("os").cpus().length;

 

var workerList = [];
function createWorker(){
	　　var worker = cluster.fork();
	　　worker.on("message", function(data){
		　　　　console.log("the worker " + worker.id + "|" + worker.process.pid + " accept data: " + JSON.stringify(data));
		　　　　if(data.type && data.type === "broadcast"){
			　　　　　　workerList.forEach(function(wk){
				　　　　　　　　wk.send(data.body);
				　　　　　　});
			　　　　}
		　　});
	　　return worker;
};

if(cluster.isMaster){
	　　console.log("master process start...");
	　　for (var i = 0; i < numCPUs; i++) {
		　　　　    workerList.push(createWorker());

		　　}
	　　cluster.on('listening',function(worker, address){
		　　　　　console.log("A worker with #" + worker.id + " pid " + worker.process.pid +
			　　　　　　　　" is now connected to " + address.address + ":" + address.port);
		　　});
	　　cluster.on('exit', function(worker, code, signal) {
		　　　　console.log('worker ' + worker.process.pid + ' died');
		　　　　process.nextTick(function(){ cluster.fork(); });
		　　});
}else{
	　　//require("./message.js");
}
