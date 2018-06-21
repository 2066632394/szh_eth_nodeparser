var Web3 = require('web3');
var web3 = new Web3();
var ethUtil = require('ethereumjs-util');
var EthTx = require('ethereumjs-tx');


var Bill = {
	web3 : null,
	coindb : null,
	host : "http://eth.bityuan.com",
	gasLimit : 1000000,
	gasPrice : 21783080000,
	uint : 100000000,
	lastNonce : 0,
	contractAddress : "0xb83a9e57e8255bcdd789c68db16d5ce5f5045350",
	jsonabi : [{"constant":false,"inputs":[{"name":"investor","type":"address"},{"name":"rmb","type":"uint256"}],"name":"investorWithdraw","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"bills","outputs":[{"name":"borrower","type":"address"},{"name":"bill","type":"uint256"},{"name":"rmb","type":"uint256"},{"name":"unit","type":"uint256"},{"name":"count","type":"uint256"},{"name":"totalcount","type":"uint256"},{"name":"starttime","type":"uint256"},{"name":"endtime","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"billId","type":"uint256"}],"name":"closeBill","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"borrower","type":"address"},{"name":"rmb","type":"uint256"}],"name":"deposit","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"feeRate2","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"investors","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"feeRate1","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"investor","type":"address"},{"name":"rmb","type":"uint256"}],"name":"investorDeposit","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"borrower","type":"address"},{"name":"bill","type":"uint256"},{"name":"rmb","type":"uint256"},{"name":"unit","type":"uint256"},{"name":"starttime","type":"uint256"},{"name":"endtime","type":"uint256"}],"name":"newBill","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"borrowers","outputs":[{"name":"rmb","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"billId","type":"uint256"},{"name":"num","type":"uint256"}],"name":"invest","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"fee1","type":"uint256"},{"name":"fee2","type":"uint256"}],"name":"setFeeRate","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"borrower","type":"address"},{"name":"rmb","type":"uint256"}],"name":"withdraw","outputs":[{"name":"","type":"bool"}],"type":"function"},{"inputs":[{"name":"fee1","type":"uint256"},{"name":"fee2","type":"uint256"}],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"borrower","type":"address"},{"indexed":false,"name":"billId","type":"uint256"}],"name":"NewBill","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"investor","type":"address"},{"indexed":false,"name":"rmb","type":"uint256"}],"name":"InvestorDeposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"investor","type":"address"},{"indexed":false,"name":"rmb","type":"uint256"}],"name":"InvestorWithdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"investor","type":"address"},{"indexed":false,"name":"billId","type":"uint256"},{"indexed":false,"name":"num","type":"uint256"}],"name":"Invest","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"borrower","type":"address"},{"indexed":false,"name":"rmb","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"borrower","type":"address"},{"indexed":false,"name":"rmb","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"investor","type":"address"},{"indexed":false,"name":"profit","type":"uint256"}],"name":"InvestProfit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"borrower","type":"address"},{"indexed":false,"name":"billId","type":"uint256"}],"name":"CloseBill","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"code","type":"uint256"}],"name":"Error","type":"event"}],
	init : function(){
		this.web3 = new Web3();
		this.web3.setProvider(new this.web3.providers.HttpProvider(this.host));
		var from = "0x8655a8083b26bdb8fea81ef3aae4ace59fb1ee9b";
		//var from = this.web3.eth.accounts[0];
		this.web3.eth.defaultAccount = from;
		var coindbContract = this.web3.eth.contract(this.jsonabi);
		this.coindb = coindbContract.at(this.contractAddress);
		return true;
	},

	/**
	 * 获取私钥
	 * @param  string randnum 用户随机码
	 * @param  string password 用户密码
	 * @return string  返回私钥
	 */
	getPrivkey : function(randnum, password){
	    /*var sha256 = sha("sha256");
	    var h = sha256.update('password', 'utf8').digest('hex');
	    var privkey = sha256.update(h + randnum).digest('hex');
	    console.log(privkey);
	    */
		var privkey = web3.sha3(web3.sha3(password) + randnum);
		privkey = privkey.substring(2, privkey.length);
		return privkey;
	},

	/**
	 * 获取用户公钥
	 * @param  string privkey 用户私钥
	 * @return string  address 返回公钥
	 */
	getPublickey : function(privkey){
		var privateKey1 = new Buffer(privkey, 'hex');
		var address = "0x" + ethUtil.privateToAddress(privateKey1).toString("hex");
		return address;
	},

	sendGas : function(adminkey, toaddress, amount, callback){
		callback = callback || this.defaultCallBack;
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
			callback(err, hash);
		});
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
		//console.log("address : "+address);
		tx["nonce"] = this.getNonce(address);
		tx["gasPrice"] = "0x" + this.gasPrice.toString(16);
		tx["gasLimit"] = "0x" + this.gasLimit.toString(16);
		var tx = new EthTx(tx);
		tx.sign(myprivatekey);
		var txstr = tx.serialize().toString("hex");
		return txstr;
	},	

	/**
	 * 设置费率接口
	 * @param  int fee 费率
	 * @param  string callback  回调函数
	 * @return 回调
	 */
	setFeeRate : function(adminkey,fee1,fee2,callback){
		callback = callback || this.defaultCallBack;
		var tx = this.coindb.setFeeRate.createTransaction(fee1,fee2);
		console.log(tx);
		var txstr = this.signTransaction(adminkey, tx);
		this.web3.eth.sendRawTransaction(txstr, function(err, hash) {
			callback(err, hash);
		});
	},

	/**
	 * 发布新的票据项目接口
	 * @param  hex address 发布者融资者地址
	 * @param  int bill  票据票面价值
	 * @param  int rmb   票据融资额
	 * @param  int uint  票据每份价格
	 * @param  int stime  票据开始时间               
	 * @param  int etime  票据结束时间
	 * @param  string callback  回调函数
	 * @return 回调
	 */
	newBill : function(privatekey,address,bill,rmb,uint,stime,etime,callback){
		callback = callback || this.defaultCallBack;
		var tx = this.coindb.newBill.createTransaction(address,bill,rmb,uint,stime,etime);
		console.log(tx);
		var txstr = this.signTransaction(privatekey, tx);
		this.web3.eth.sendRawTransaction(txstr, function(err, hash) {
			callback(err, hash);
		});
	},

	/**
	 * 投资者存入资金
	 * @param  hex address 投资者地址
	 * @param  int rmb 存入金额
	 * @param  string callback  回调函数
	 * @return 回调
	 */
	investorDeposit : function(privatekey,address,rmb,callback){
		callback = callback || this.defaultCallBack;
		var tx = this.coindb.investorDeposit.createTransaction(address,rmb);
		console.log(tx);
		var txstr = this.signTransaction(privatekey, tx);
		this.web3.eth.sendRawTransaction(txstr, function(err, hash) {
			callback(err, hash);
		});
	},

	/**
	 * 投资者取出资金
	 * @param  hex address 投资者地址
	 * @param  int rmb 取出金额
	 * @param  string callback  回调函数
	 * @return 回调
	 */
	investorWithdraw : function(privatekey,address,rmb,callback){
		callback = callback || this.defaultCallBack;
		var tx = this.coindb.investorWithdraw.createTransaction(address,rmb);
		console.log(tx);
		var txstr = this.signTransaction(privatekey, tx);
		this.web3.eth.sendRawTransaction(txstr, function(err, hash) {
			callback(err, hash);
		});
	},

	/**
	 * 投资者投资票据项目
	 * @param  int billId 票据Id
	 * @param  int num 买入份数
	 * @param  string callback  回调函数
	 * @return 回调
	 */
	invest : function(privatekey,billId,num,callback){
		callback = callback || this.defaultCallBack;
		var tx = this.coindb.invest.createTransaction(billId,num);
		console.log(tx);
		var txstr = this.signTransaction(privatekey, tx);
		this.web3.eth.sendRawTransaction(txstr, function(err, hash) {
			callback(err, hash);
		});
	},

	/**
	 * 融资者存入资金
	 * @param  hex address 投资者地址
	 * @param  int rmb 存入金额
	 * @param  string callback  回调函数
	 * @return 回调
	 */
	deposit : function(privatekey,address,rmb,callback){
		callback = callback || this.defaultCallBack;
		var tx = this.coindb.deposit.createTransaction(address,rmb);
		console.log(tx);
		var txstr = this.signTransaction(privatekey, tx);
		this.web3.eth.sendRawTransaction(txstr, function(err, hash) {
			callback(err, hash);
		});
	},

	/**
	 * 融资者取出资金
	 * @param  hex address 投资者地址
	 * @param  int rmb 取出金额
	 * @param  string callback  回调函数
	 * @return 回调
	 */
	withdraw : function(privatekey,address,rmb,callback){
		callback = callback || this.defaultCallBack;
		var tx = this.coindb.withdraw.createTransaction(address,rmb);
		console.log(tx);
		var txstr = this.signTransaction(privatekey, tx);
		this.web3.eth.sendRawTransaction(txstr, function(err, hash) {
			callback(err, hash);
		});
	},

	/**
	 * 融资者还款并关闭交易
	 * @param  int billId 票据ID
	 * @param  string callback  回调函数
	 * @return 回调
	 */
	closeBill : function(privatekey,billId,callback){
		callback = callback || this.defaultCallBack;
		var tx = this.coindb.closeBill.createTransaction(billId);
		console.log(tx);
		var txstr = this.signTransaction(privatekey, tx);
		this.web3.eth.sendRawTransaction(txstr, function(err, hash) {
			callback(err, hash);
		});
	},

}
module.exports = Bill;
