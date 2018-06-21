// mysql
var dbConfig = require('./config/db.js');
var Dbobject = require('./lib/poolClient.js');
var DB = new Dbobject(dbConfig.pooldb);
DB.createPool();

// web3
var Web3 = require('web3');
var web3 = new Web3();
//web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"));
web3.setProvider(new web3.providers.HttpProvider("http://192.168.1.67:8545"));
module.exports = BpContract;

function BpContract(tx, receipt) {
	this.tx = tx;
	this.receipt = receipt;
	this.coinAddress = "0xb2ddc0c5d5e5c82e38a27048e26f3dcd9aed7f73";
	// 插入placeOrder
	this.insertPlaceOrders = function() {
		var tx = this.tx;
		var receipt = this.receipt;
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
			time : tx.timestamp,//web3.eth.getBlock(tx.blockNumber).timestamp,
			addtime : Date.now(),		
		};
		console.log(tx.hash, tx.to, "placeorder");
		DB.insert("bp_placeorders", insertData);
	}
	// 插入cancelorder
	this.insertCancelOrders = function() {
		var tx = this.tx;
		var receipt = this.receipt;
		var insertData = {			
			blocknumber : tx.blockNumber,
			txhash : tx.hash,
			contract : tx.to,
			offerid : receipt.logs[0].args.offerId,
			account : receipt.logs[0].args.from,
			time : tx.timestamp,//web3.eth.getBlock(tx.blockNumber).timestamp,
			addtime : Date.now(),
		};
		console.log(tx.hash, tx.to, "cancelorder");
		DB.insert("bp_cancelorders", insertData);
	}
	// 插入matchOrder
	this.insertMatchOrders = function() {
		var tx = this.tx;
		var receipt = this.receipt;
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
			time : tx.timestamp,//web3.eth.getBlock(tx.blockNumber).timestamp,
			addtime : Date.now(),
		};
		console.log(tx.hash, tx.to, "matchorder");
		DB.insert("bp_matchorders", insertData);
	}
	// 插入sendcoin
	this.insertSendCoins = function() {
		var tx = this.tx;
		var receipt = this.receipt;
		var type = 0;
		var coinAddress = this.coinAddress;
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
			time : tx.timestamp,//web3.eth.getBlock(tx.blockNumber).timestamp,
			addtime : Date.now(),
		};
		console.log(tx.hash, tx.to, "sendcoin");
		DB.insert("bp_sendcoins", insertData);
	}

	this.run = function() {
		var tx = this.tx;
		if (tx["func"] == "placeOrder") {
			this.insertPlaceOrders();
		}
		if (tx["func"] == "cancelOrder") {
			this.insertCancelOrders();
		}
		if (tx["func"] == "matchOrder") {
			this.insertMatchOrders();
		}
		if (tx["func"] == "sendCoin") {
			this.insertSendCoins();
		}
	}

	this.run();
}