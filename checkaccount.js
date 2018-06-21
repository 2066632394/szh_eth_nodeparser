// 多进程模块cluster
var cluster = require('cluster');
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
	
	// web3
	var Web3 = require('web3');
	var web3 = new Web3();
	web3.setProvider(new web3.providers.HttpProvider("http://120.27.97.197:8545"));

    checkaccount();

    function checkaccount(){
        DB.delete("accounts",{'condition':"account = 'null'"});
    	DB.findAll("accounts","account",accountlist,{'condition':'type=0'});
    }

    function accountlist(rows){

    	var stime = new Date().getTime();

    	if( rows.length >0 ){

    		console.log('accounts num --'+rows.length);

    		var type = 0;

    		for (var i = 0; i < rows.length; i++) {

    			console.log('account : '+rows[i].account);

 				if(rows[i].account != null && rows[i].account != 'null'){

 				 	var code = web3.eth.getCode(rows[i].account);

 				 	if(code &&  code.length==2){
 				 		type = 2;//normal account
 				 	}else if (code && code.length >2){
 				 		type = 1;//contract account
 				 	}else {
 				 		type = 0;//unknow account
 				 	}

 				 	updateAccountData(rows[i].account,type);

 				 	console.log('code length : '+code.length + ' type : '+type);
 				 }
    		}
    	}else{

    		console.log('no accounts to check');
    		
    	}

    	var etime = new Date().getTime();

    	console.log('task token : '+(etime-stime));

    	setTimeout(checkaccount,60000);
    }

    //update account type 
    function updateAccountData(account,type){

    	if( type > 0 ){

    		DB.update('accounts',{'type':type},updateresult,{'condition':"account='"+account +"'"});

    	}

    }

    function updateresult(res){

    	//console.log('update result : '+JSON.stringify(res));

    }


}