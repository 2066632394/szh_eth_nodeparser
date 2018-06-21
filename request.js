var http = require('http');  

var qs = require('querystring');  


exports.sendLog= function (req, res,log) {  

	var data = {  
		log: 'test@test.com',  
	};  

	data = JSON.stringify(data);  
	console.log(data);  
	var opt = {  
		method: "POST",  
		host: "localhost",  
		port: 8888,  
		path: "/",  
		headers: {  
			"Content-Type": 'application/json',  
			"Content-Length": data.length  
		}  
	};  

	var req = http.request(opt, function (serverFeedback) {  
		if (serverFeedback.statusCode == 200) {  
			var body = "";  
			serverFeedback.on('data', function (data) { body += data; })  
		.on('end', function () { res.send(200, body); });  
		}  
		else {  
			res.send(500, "error");  
		}  
	});  
	req.write(data + "\n");  
	req.end();  
}  


