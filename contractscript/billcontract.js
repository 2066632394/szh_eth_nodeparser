// mysql
var dbConfig = require('../config/db.js');
var Dbobject = require('../lib/poolClient.js');
var DB = new Dbobject(dbConfig.pooldb1);
DB.createPool();

// web3
var Web3 = require('web3');
var web3 = new Web3();
//web3.setProvider(new web3.providers.HttpProvider("http://192.168.1.33:8545"));
web3.setProvider(new web3.providers.HttpProvider("http://eth.bityuan.com:80"));
module.exports = TradeContract;

var n128 = web3.toBigNumber(2).pow(128);

function TradeContract(tx, receipt) {
	this.tx = tx;
	this.receipt = receipt;

	this.insertPlaceOrders = function() {
		var tx = this.tx;
		var receipt = this.receipt;
		var orderCreateLog,
		    mtfEventLog;
		for(var k = 0; k < receipt.logs.length; k++) {
			if(receipt.logs[k].event == "OrderCreate") {
				orderCreateLog = receipt.logs[k];
			}
			if(receipt.logs[k].event == "MtfEvent") {
				mtfEventLog = receipt.logs[k];
			}
		}
		// 插入placeOrder
		if(orderCreateLog != undefined){
			var insertDataOrderCreate = {				
				txhash : tx.hash,
				blocknumber : tx.blockNumber,
				contract : tx.to,
				offerid : orderCreateLog.args.offerId.toNumber(),
				account : orderCreateLog.args.from,
				price : orderCreateLog.args.pirceamount.divToInt(n128).toNumber(),
				amount : orderCreateLog.args.pirceamount.mod(n128).toNumber(),
				symbol : web3.toAscii(tx.args[0]).substr(0,6),
				isbuy : tx.args[3] ? 1 : 0,
				time : tx.timestamp,
				addtime : Date.now(),	
			};
			//console.log(insertDataOrderCreate, "insert");
			//console.log(tx.hash, tx.to, "placeorder");
			DB.insert("trade_placeorders", insertDataOrderCreate);
		}
		// 插入matchOrder
		if(mtfEventLog != undefined) {
			//console.log(mtfEventLog);
			var insertDataMtfEvent = {				
				txhash : tx.hash,
				blocknumber : tx.blockNumber,
				contract : tx.to,
				account : mtfEventLog.args.from,
				mtfid : mtfEventLog.args.mtfId.toNumber(),
				offerid : mtfEventLog.args.offerIdwantId.divToInt(n128).toNumber(),
				wantid : mtfEventLog.args.offerIdwantId.mod(n128).toNumber(),
				price : mtfEventLog.args.priceamount.divToInt(n128).toNumber(),
				amount : mtfEventLog.args.priceamount.mod(n128).toNumber(),
				time : tx.timestamp,
				addtime : Date.now(),	
			};
			//console.log(insertDataMtfEvent, "insertMtf");
			//console.log(tx.hash, tx.to, "MtfEvent");
			DB.insert("trade_matchorders", insertDataMtfEvent);
		}		
	}
	// 插入cancelorder
	this.insertCancelOrders = function() {
		var tx = this.tx;
		var receipt = this.receipt;
		var cancelOrderEventLog;
		for(var k = 0; k < receipt.logs.length; k++) {
			if(receipt.logs[k].event == "CancelOrderEvent") {
				cancelOrderEventLog = receipt.logs[k];
			}
		}
		if(cancelOrderEventLog != undefined){
			var insertData = {	
				txhash : tx.hash,		
				blocknumber : tx.blockNumber,				
				contract : tx.to,
				account : cancelOrderEventLog.args.from,
				offerid : cancelOrderEventLog.args.id.toNumber(),
				price : cancelOrderEventLog.args.priceamount.divToInt(n128).toNumber(),
				amount : cancelOrderEventLog.args.priceamount.mod(n128).toNumber(),
				time : tx.timestamp,
				addtime : Date.now(),
			};
			//console.log(insertData, "cancelorder");
			//console.log(tx.hash, tx.to, "cancelorder");
			DB.insert("trade_cancelorders", insertData);
		}
	}

	// 插入sendcoin
	this.insertSendCoins = function() {
		var tx = this.tx;
		var receipt = this.receipt;
		var sendCoinLog;
		var type = 0;
		for(var k = 0; k < receipt.logs.length; k++) {			
			if(receipt.logs[k].event == "Deposit") {
				sendCoinLog = receipt.logs[k];
				type = 1;
			}
			if(receipt.logs[k].event == "Withdraw") {
				sendCoinLog = receipt.logs[k];
				type = 2;
			}
		}
		var insertData = {			
			txhash : tx.hash,
			blocknumber : tx.blockNumber,
			contract : tx.to,
			type : type,
			addr : sendCoinLog.args.addr,
			bankaddr : sendCoinLog.args.bankaddr,
			currency : web3.toAscii(sendCoinLog.args.currency).substr(0,3),
			amount : sendCoinLog.args.amount,
			time : tx.timestamp,
			addtime : Date.now(),
		};
		//console.log(insertData, "sendcoin");
		//console.log(tx.hash, tx.to, "sendcoin");
		DB.insert("trade_sendcoins", insertData);
	}

	this.run = function() {
		var tx = this.tx;
		var receipt = this.receipt;
		//console.log(tx['func']);
		if (tx["func"] == "placeOrder") {
			this.insertPlaceOrders();
		}
		if (tx["func"] == "cancelOrder") {
			this.insertCancelOrders();
		}
		if (tx["func"] == "sendCoin") {
			this.insertSendCoins();
		}
	}

	this.run();
}
