var async = require("async");
var httpClient = require("./request");

var sum = 10;
var t = {"1":0, "2":0,"3":0, "4":0};
var c=0;

for(var i=0; i<sum; i++){
	async.series([
			function(cb){
				httpClient(function(str){
					if(str === "worker1")
					t["1"] = parseInt(t["1"] || 0) + 1;
				if(str === "worker2")
					t["2"] = parseInt(t["2"] || 0) + 1;
				if(str === "worker3")
					t["3"] = parseInt(t["3"] || 0) + 1;
				if(str === "worker4")
					t["4"] = parseInt(t["4"] || 0) + 1;
				cb();
				});
			}
			], function(err, result){
				if(err){
					console.log(err);
				}
				c++;
				if(c == sum){
					console.log(t);
				}
			});
}
