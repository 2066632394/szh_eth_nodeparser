process.on("message", function(data){
	　　console.log("the process %s accept data: %s", process.pid, JSON.stringify(data));
});
