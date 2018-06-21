var Web3 = require('web3');
var Async = require('async');
var EthTx = require('ethereumjs-tx');

var Coin = {
	web3 : null,
	coindb : null,
	host : "http://122.224.124.250:8545",
	gasLimit : 1000000,
	gasPrice : 21783080000,
	coinUint : 100000000,
	priceUint : 100000000,
	lastNonce : 0,
	symbols : {
		'OILCNY':{"name":"OILCNY", 'uint':100000000},
		'BTCCNY':{"name":"BTCCNY", 'uint':100000000},
		'BTYCNY':{"name":"BTYCNY", 'uint':100000000},
		'ETCCNY':{"name":"ETCCNY", 'uint':100000000},
		'ETHCNY':{"name":"ETHCNY", 'uint':100000000}
	},
	currencys : {
		'CNY':{"name":"CNY", 'uint':100000000},
		'BTC':{"name":"BTC", 'uint':100000000},
		'BTY':{"name":"BTY", 'uint':100000000},
		'ETC':{"name":"ETC", 'uint':100000000},
		'OIL':{"name":"OIL", 'uint':100000000},
		'ETH':{"name":"ETH", 'uint':100000000}
	},
	jsonabi : [{"constant":true,"inputs":[{"name":"name","type":"bytes33"}],"name":"isInit","outputs":[{"name":"_r","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"note","type":"string"},{"name":"value","type":"uint256"}],"name":"newCoin","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"}],"name":"cancelOrder","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"status","outputs":[{"name":"_r","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"},{"name":"_a","type":"address"}],"name":"coinBalanceOf","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"canTrade","outputs":[{"name":"_r","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"getOrderCount","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"},{"name":"_a","type":"address"}],"name":"coinFrozenOf","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"symbols","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"getCount","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"symbol","type":"bytes32"},{"name":"price","type":"uint256"},{"name":"amount","type":"uint256"},{"name":"isbuy","type":"bool"}],"name":"placeOrder","outputs":[{"name":"_offerId","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"limit","type":"uint256"}],"name":"bytes32arr","outputs":[{"name":"ok","type":"bool"},{"name":"buy","type":"uint256[]"},{"name":"sell","type":"uint256[]"}],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"approveBank","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"coins","outputs":[{"name":"value","type":"uint256"},{"name":"name","type":"bytes32"},{"name":"note","type":"string"},{"name":"owner","type":"address"},{"name":"status","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"ids","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"bankList","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"first","type":"bytes32"},{"name":"second","type":"bytes32"}],"name":"newsymbol","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"coinBalance","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"symbol","type":"bytes32"},{"name":"limit","type":"uint256"}],"name":"marketInfo","outputs":[{"name":"ok","type":"bool"},{"name":"buy","type":"uint256[]"},{"name":"sell","type":"uint256[]"}],"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"_val","type":"uint256"},{"name":"_to","type":"address"}],"name":"sendCoin","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"isBank","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"code","type":"bytes32"}],"name":"Error","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"code","type":"bytes32"},{"indexed":false,"name":"a","type":"uint256"},{"indexed":false,"name":"b","type":"uint256"}],"name":"ErrorInt","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"id","type":"uint256"}],"name":"CreateCoin","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"}],"name":"CreateSymbol","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"}],"name":"CreateMatch","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"bank","type":"address"}],"name":"ApproveBank","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"mtfId","type":"uint256"},{"indexed":false,"name":"offerIdwantId","type":"uint256"},{"indexed":false,"name":"priceamount","type":"uint256"}],"name":"MtfEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"offerId","type":"uint256"},{"indexed":false,"name":"pirceamount","type":"uint256"}],"name":"OrderCreate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"bankaddr","type":"address"},{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"currency","type":"bytes32"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"bankaddr","type":"address"},{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"currency","type":"bytes32"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"addr","type":"address"},{"indexed":false,"name":"currency","type":"bytes32"},{"indexed":false,"name":"amount","type":"int256"},{"indexed":false,"name":"frozen","type":"int256"}],"name":"UpdateWallet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"priceamount","type":"uint256"}],"name":"CancelOrderEvent","type":"event"}],
	contractAddress : '0x1d58f5ce187ac3687c0cfa8cdfccd5506454facd',

	init : function(){
		this.web3 = new Web3();
		this.web3.setProvider(new this.web3.providers.HttpProvider(this.host));
		var from = this.web3.eth.accounts[0];
		this.web3.eth.defaultAccount = from;
		var coindbContract = this.web3.eth.contract(this.jsonabi);
		this.coindb = coindbContract.at(this.contractAddress);
		return true;
	},

	getNonce : function(address){
		var nonce = this.web3.eth.getTransactionCount(address);
		if(this.lastNonce >= nonce){
			this.lastNonce++;
		}else{
			this.lastNonce = nonce;
		}
		console.log('address:' + address + ';nonce:' + this.lastNonce);
		return this.lastNonce;
	},

	signTransaction : function(privatekey, tx){
		var myprivatekey = new Buffer(privatekey, 'hex');
		var address = "0x" + ethUtil.privateToAddress(myprivatekey).toString("hex");
		tx["nonce"] = this.getNonce(address);
		tx["gasPrice"] = "0x" + this.gasPrice.toString(16);
		tx["gasLimit"] = "0x" + this.gasLimit.toString(16);
		var tx = new EthTx(tx);
		tx.sign(myprivatekey);
		var txstr = tx.serialize().toString("hex");
		return txstr;
	},

	approveBank : function(address, adminkey){
		var that = this;
		var tx = this.coindb.approveBank.createTransaction(address);
		var txstr = this.signTransaction(adminkey, tx);
		Async.series([
			function(cb) {
				that.web3.eth.sendRawTransaction(txstr, function(err, hash) {
					cb(err, hash);
				});
			}
		],function(err, hash) {
			if(err){
				console.log('error:' + err);
			}else{
				console.log('approveBank succ');
			}
		});
	},

	sendGas : function(adminkey, toaddress, amount, callback, params){
		callback = callback || this.defaultCallBack;
		params = params || {};
		var myprivatekey = new Buffer(adminkey, 'hex');
		var adminadress = "0x" + ethUtil.privateToAddress(myprivatekey).toString("hex");
		var tx = {};
		tx["nonce"] = this.getNonce(adminadress);
		tx["gasPrice"] = "0x" + this.gasPrice.toString(16);
		tx["gasLimit"] = "0x" + this.gasLimit.toString(16);
		tx["to"] = toaddress;
		tx["value"] = this.web3.fromDecimal(this.web3.toWei(amount, 'ether'));
		var tx = new EthTx(tx);
		tx.sign(myprivatekey);
		var txstr = tx.serialize().toString("hex");
		this.web3.eth.sendRawTransaction(txstr, function(err, hash) {
			callback(err, hash, params);
		});
	},

	sendCoin : function(address, adminkey, currency, amount, callback, params){
		callback = callback || this.defaultCallBack;
		params = params || {};
		var that = this;
		if(this.currencys.hasOwnProperty(currency)){
			var amount = parseFloat(amount) * this.currencys[currency]['uint'];
			var tx = this.coindb.sendCoin.createTransaction(currency, amount, address);
			var txstr = this.signTransaction(adminkey, tx);
			this.web3.eth.sendRawTransaction(txstr, function(err, hash) {
				callback(err, hash, params);
			});
		}else{
			callback("currency错误", "-1");
		}
	},

	getReceipt : function(hash){
		var obj = this.web3.eth.getTransactionReceipt(hash);
		return obj;
	},

	cancelOrder : function(privatekey, orderid, callback, params){
		callback = callback || this.defaultCallBack;
		params = params || {};
		var tx = this.coindb.cancelOrder.createTransaction(orderid);
		var txstr = this.signTransaction(privatekey, tx);
		this.web3.eth.sendRawTransaction(txstr, function(err, hash) {
			callback(err, hash, params);
		});
	},
	placeOrder : function(privatekey, symbol, price, amount, isbuy, callback){
		callback = callback || this.defaultCallBack;
		if(this.symbols.hasOwnProperty(symbol)){
			var price = parseFloat(price) * this.symbols[symbol]['uint'];
			var amount = parseFloat(amount) * this.symbols[symbol]['uint'];
			if(price < 10000){
				callback("价格错误", "-1");
			}else if(amount < 10000){
				callback("数量错误", "-1");
			}else{
				var tx = this.coindb.placeOrder.createTransaction(symbol, price, amount, isbuy);
				var txstr = this.signTransaction(privatekey, tx);
				this.web3.eth.sendRawTransaction(txstr, function(err, hash) {
					callback(err, hash);
				});
			}
		}else{
			callback("symbol错误", "-1");
		}
	},
	defaultCallBack : function(err, hash, params){
		params = params || {};
		if(err){
			console.log('error:' + err);
		}else{
			console.log("hash:" + hash + ';op succ');
		}
	}


};
module.exports = Coin;
