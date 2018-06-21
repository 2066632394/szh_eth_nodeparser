// 多进程模块cluster
var cluster = require('cluster');
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
	web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));

	var bpContractAddress = "0xdcf4c529397667711e00923d7809493c32260108"; 
	
	var abiJson = [{"constant":false,"inputs":[{"name":"_offerCurrency","type":"bytes32"},{"name":"_offerValue","type":"uint256"},{"name":"_wantCurrency","type":"bytes32"},{"name":"_wantValue","type":"uint256"}],"name":"placeOrder","outputs":[{"name":"_offerId","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"isInit","outputs":[{"name":"_r","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"isAdmin","outputs":[{"name":"_r","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"actionId","type":"uint256"},{"name":"id1s","type":"uint256[]"},{"name":"id2s","type":"uint256[]"}],"name":"matchOrders","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"note","type":"string"},{"name":"value","type":"uint256"}],"name":"newCoin","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"admins","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"},{"name":"ok","type":"bool"}],"name":"setAdmin","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"actionId","type":"uint256"},{"name":"ids1","type":"uint256[]"}],"name":"cancelOrders","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"maxaction","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"actionId","type":"uint256"},{"name":"_offerId","type":"uint256"}],"name":"cancelOrderOne","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_offerId","type":"uint256"}],"name":"cancelOrder","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"status","outputs":[{"name":"_r","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"},{"name":"_a","type":"address"}],"name":"coinBalanceOf","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"getSender","outputs":[{"name":"_r","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"canTrade","outputs":[{"name":"_r","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"orders","outputs":[{"name":"creator","type":"address"},{"name":"offerCurrency","type":"bytes32"},{"name":"offerValue","type":"uint256"},{"name":"wantCurrency","type":"bytes32"},{"name":"wantValue","type":"uint256"},{"name":"allowCancel","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[],"name":"getCount","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"actionId","type":"uint256"},{"name":"_offerId1","type":"uint256"},{"name":"_offerId2","type":"uint256"}],"name":"matchOrder","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"coins","outputs":[{"name":"value","type":"uint256"},{"name":"name","type":"bytes32"},{"name":"note","type":"string"},{"name":"owner","type":"address"},{"name":"status","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"ids","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"coinBalance","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"_val","type":"uint256"},{"name":"_to","type":"address"}],"name":"sendCoin","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Sent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"id","type":"uint256"}],"name":"Create","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"offerId","type":"uint256"}],"name":"OrderCreate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"actionId","type":"uint256"},{"indexed":false,"name":"offerId1","type":"uint256"},{"indexed":false,"name":"offerId2","type":"uint256"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"MathOrder","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"offerId","type":"uint256"}],"name":"CancelOrder","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"offerId","type":"uint256"},{"indexed":false,"name":"actionId","type":"uint256"}],"name":"CancelOrderSystem","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"code","type":"uint256"}],"name":"Error","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"currencyPair","type":"bytes32"},{"indexed":true,"name":"seller","type":"address"},{"indexed":false,"name":"offerValue","type":"uint256"},{"indexed":true,"name":"buyer","type":"address"},{"indexed":false,"name":"wantValue","type":"uint256"}],"name":"Traded","type":"event"}];

	var bpCoindbContract = web3.eth.contract(abiJson);
	var bpCoindb = bpCoindbContract.at(bpContractAddress);
	
	var coinAddress = "0xb2ddc0c5d5e5c82e38a27048e26f3dcd9aed7f73";
	
	var condition = "towhere = " + "'" + bpContractAddress + "'";
	DB.findAll("transactions", "*", function(rows) {
		console.log(rows);
	},{'condition' : condition, 'limit':10});
	
	/*var loopStart = 631264;

	blockLoop();	
	
	// 按区块高度循环
	function blockLoop() {
		var topblock = web3.eth.blockNumber;
		if(loopStart > topblock) {
			console.log(loopStart+" is pendding!");
			blockLoop();
			return;
		}
		console.log(loopStart);
		web3.eth.getBlock(loopStart, true, function(err, block){
			if (err != null) {
				console.log(err)
				throw new Error("panic");
			}
			//console.log(block);
			parseBlock(block);
			loopStart++;
			blockLoop();
		})
	}
	
	// 解析区块
	function parseBlock(block) {
		//console.log(block);
		var txs = block.transactions;
		var receipts = block.receipts;
		for (var j = 0; j < txs.length; j++) {
			if(txs[j].to != bpContractAddress) {
				continue;	
			} else {
				var inputDecode = parseTxInput(txs[j].input);
				if(!inputDecode) {
					continue;
				} else {
					txs[j]["func"] = inputDecode["func"];
					txs[j]["args"] = inputDecode["args"];
				}
				for (var k = 0; k < receipts[j].logs.length; k++) {									
					bpCoindb.decodeLog(receipts[j].logs[k]);
				}
				parseContract(txs[j], receipts[j]);
			}
		}
	}
	
	// 解析交易的input
	function parseTxInput(input) {
		var match = abiJson.filter(function (jsondata) {			
			if (!jsondata)
			{
				return false;
			}
			if (!jsondata.name) {
				return false;
			}
			if (!bpCoindb[jsondata.name] || !bpCoindb[jsondata.name].signature) {
				return false;
			}
			if (bpCoindb[jsondata.name].signature() == input.slice(2, 10)) {
				return true;
			}
		})
		var inputDecode = [];		
		if (!match || match.length == 0) { // cannot find matching event?
			console.warn('cannot find event for log');
			return false;
		}		
		
		inputDecode["func"] = match[0].name;
		inputDecode["args"] = bpCoindb[match[0].name].unpackArgs(input);
		
		return inputDecode;
	}
	
	// 解析合约
	function parseContract(tx, receipt) {
		if (typeof receipt["logs"] === "undefined" || receipt["logs"].length == 0 || receipt["logs"][0].event == "Error") {
			return null;
		}
		if (tx["func"] == "placeOrder") {
			insertPlaceOrders(tx, receipt)
		}
		if (tx["func"] == "cancelOrder") {
			insertCancelOrders(tx, receipt);
		}
		if (tx["func"] == "matchOrder") {
			insertMatchOrders(tx, receipt);
		}
		if (tx["func"] == "sendCoin") {
			insertSendCoins(tx, receipt);
		}
	}
		
	// 插入placeOrder
	function insertPlaceOrders(tx, receipt) {
		console.log(tx.hash, 'placeOrder');					
		var insertData = {			
			blocknumber : tx.blockNumber,
			txhash : tx.hash,
			contract : tx.to,
			offerid : receipt.logs[1].args.offerId,
			account : receipt.logs[1].args.from,
			offer_currency : web3.toAscii(tx.args[0]).substr(0,3),
			offer_value : tx.args[1].toNumber(),
			want_currency : web3.toAscii(tx.args[2]).substr(0,3),
			want_value : tx.args[3].toNumber(),
			time : web3.eth.getBlock(tx.blockNumber).timestamp,
			addtime : Date.now(),		
		};
		//console.log(insertData);
		DB.insert("bp_placeorders", insertData);
	}
	// 插入cancelorder
	function insertCancelOrders(tx, receipt) {
		console.log(tx.hash, 'cancelOrder');		
		var insertData = {			
			blocknumber : tx.blockNumber,
			txhash : tx.hash,
			contract : tx.to,
			offerid : receipt.logs[0].args.offerId.toNumber(),
			user : receipt.logs[0].args.from,
			time : web3.eth.getBlock(tx.blockNumber).timestamp,
			addtime : Date.now(),
		};
		//console.log(insertData);
		DB.insert("bp_cancelorders", insertData);
	}
	// 插入matchOrder
	function insertMatchOrders(tx, receipt) {
		console.log(tx.hash, 'matchOrder');				
		var insertData = {		
			blocknumber : tx.blockNumber,
			txhash : tx.hash,
			contract : tx.to,
			actionid : receipt.logs[0].args.actionId.toNumber(),
			offerid1er : receipt.logs[1].args.to,
			offerid2er : receipt.logs[2].args.to,		
			offerid1 : receipt.logs[0].args.offerId1.toNumber(),
			offerid2 : receipt.logs[0].args.offerId2.toNumber(),
			amount : receipt.logs[0].args.amount.toNumber(),
			price : receipt.logs[1].args.amount.toNumber()/receipt.logs[2].args.amount.toNumber(),
			time : web3.eth.getBlock(tx.blockNumber).timestamp,
			addtime : Date.now(),
		};
		//console.log(insertData);
		DB.insert("bp_matchorders", insertData);
	}
	// 插入sendcoin
	function insertSendCoins(tx, receipt) {
		console.log(tx.hash, 'sendCoin');
		var type = 0;
		if(receipt.logs[0].args.from == coinAddress) type = 1;
		if(receipt.logs[0].args.to == coinAddress) type = 2;
		var insertData = {			
			blocknumber : tx.blockNumber,
			txhash : tx.hash,
			contract : tx.to,
			type : type,
			tfrom : receipt.logs[0].args.from,
			towhere : receipt.logs[0].args.to,
			name : web3.toAscii(receipt.logs[0].args.name).substr(0,3),
			amount : receipt.logs[0].args.amount.toNumber(),
			time : web3.eth.getBlock(tx.blockNumber).timestamp,
			addtime : Date.now(),
		};
		//console.log(insertData);
		DB.insert("bp_sendcoins", insertData);
	}*/	
}	
	
	
	
	
	
	
	
	