var async = require("async");
var white = ["0x5d45ee5be79b46d3c3df241b995eba56805ab847",
    "0xf01f5f5000ebf1b3aa6755137afc90e0d313d8a2",
    "0x32b6a1120d0ed7c559c74abc8d8f30f01bc70146",
    "0x329fd0032bbe8a8ba8524dc34888e81af57eba7d",
    "0x23e635d3129a492a4bcbe130dd88186652e5a460"];

var dbConfig = require('./config/db.js');
var Dbobject = require('./lib/poolClient.js');
var DB = new Dbobject(dbConfig.pooldb_btc);
DB.createPool();

getLoopStartBlock();

// 获取数据库最大的update value
function getLoopStartBlock() {
	var order = "blocknumber DESC";
	DB.findOne("trade_config", "value", callGetLoopStartBlock, {'limit':1, 'condition':"name='hedge'"});
}
// 获取数据库最大的blocknumber回调
function callGetLoopStartBlock(row) {
	if(row.length != 0 && row.value != "undefined") {
		loopStart = row.value;//row.block-step;
		console.log('start -----'+loopStart);

	} else {
		console.log(row);
		insertHedgeConfigData();
		loopStart = 0;
	}
	console.log("start mtfid : "+loopStart);
	blockLoop();
}   

function blockLoop(){
	DB.findAll("trade_matches", "*", GetAllMatch, {'limit':1000,'order':"id asc", 'condition':"symbol=3 and id > "+loopStart});
}

function GetAllMatch(rows){
	if(rows.length>0){
		async.eachSeries(rows,function(item,callback){
				console.log('start block :'+item['id']);
				var stime = new Date().getTime();
				parseData(item,function(err,res){
						callback(err,res);
						})
				},function(error){
				if(error){
				console.log('eachasync error :'+error);
				}
				setTimeout(getLoopStartBlock, 200);
				})	
	}else{
		setTimeout(getLoopStartBlock, 500);
	}
}


function parseData(item,callback){
	DB._pool.getConnection(function (err, connection) {
			if (err) {
			callback(err, null);
			}
			connection.beginTransaction(function (err) {
					if (err) {
					callback(err, null);
					}
					console.log("tran---start :");
					var funcArr = [];

					var temp = parseLogs(item,connection);
					funcArr.push(temp);

					var sql_log = function(cb){
					connection.query("update trade_config set value = ? where name = ?",[item['id'],"hedge"], function (tErr, rows, fields) {
							if (tErr) {
							connection.rollback(function () {
									console.log("事务失败，，ERROR：" + tErr);
									throw tErr;
									});
							}else{
							cb(null,"ok");
							}
							})	
					};

					funcArr.push(sql_log);
					console.log("block log length : "+funcArr.length);
					async.series(funcArr, function (err, result) {
							console.log("tran-- " + err);
							if (err) {
							connection.rollback(function (err) {
									console.log("transaction error: " + err);
									connection.release();
									callback(err, null);
									});
							} else {
							connection.commit(function (err, info) {
									//console.log("transaction info: " + JSON.stringify(info));
									if (err) {
									console.log("执行事务失败，" + err);
									connection.rollback(function (err) {
											console.log("transaction error: " + err);
											connection.release();
											callback(err, null);
											});
									} else {
									console.log('commit --succ');
									connection.release();
									callback(null, info);
									}
									})
							}
					})


			});
	})
}

function parseLogs(item,connection){

	var passive_owner = "";
	var active_owner = item['active_owner'];
	var type = 0;
	var temp = function(cb){
		connection.query("select owner from trade_order where id = ?", [item['passive_id']], function (tErr, rows, fields) {
				if (tErr) {
				connection.rollback(function () {
						console.log("事务失败，，ERROR：" + tErr);
						throw tErr;
						});
				}else{
				if(rows.length>0){
				passive_owner = rows[0]['owner'];
				var active = white.indexOf(active_owner);
				var passive = white.indexOf(passive_owner);
				if(passive == -1 && active >=0 ){
				type = item['type'] ? 0 : 1;
				}else if (passive >=0  && active == -1){
				type = item['type'];
				}
//				console.log("passive_owner : "+passive+ " active_owner : "+active);
				var p = false;
				var a = false;
				if(passive>=0){
					p = true;
				}
				if(active>=0){
					a = true;
				}
				console.log("passive_owner : "+passive+ " active_owner : "+active+" is hedge :  "+(p^a));
				if((p ^ a )){
				console.log("id ========================================================================= "+item['id']);
				connection.query("INSERT INTO trade_hedge_list (mid,passive_id,active_id,matchtime,price,amount,type) values (?,?,?,?,?,?,?)", 
						[item['id'],item['passive_id'],item['active_id'],item['matchtime'],item['price'],item['amount'],type], function (tErr, rows, fields) {
						if (tErr) {
						connection.rollback(function () {
								console.log("事务失败，，ERROR：" + tErr);
								throw tErr;
								});
						}else{
						cb(null,"ok");
						}
						})
				}else{
					cb(null,"ok");
				}
				}else{
					cb(null,"ok");
				}
				}
		})
	}
	return temp;
}


function insertHedgeConfigData() {
	var insertData = {
name : "hedge",
       value : 0,
	};
	DB.insert("trade_config", insertData);	
}
