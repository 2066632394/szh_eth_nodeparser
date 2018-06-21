var Web3 = require('web3');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider("http://112.124.0.115:8545"));

var	_jsonabi = [{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"title","type":"string"},{"name":"note","type":"string"},{"name":"starttime","type":"uint256"},{"name":"endtime","type":"uint256"},{"name":"value","type":"uint256"}],"name":"newCoin","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"starttime","type":"uint256"},{"name":"endtime","type":"uint256"},{"name":"rate","type":"uint256"},{"name":"basevalue","type":"uint256"}],"name":"calc","outputs":[{"name":"totalvalue","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"isInit","outputs":[{"name":"_r","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"}],"name":"closeBill","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"}],"name":"approveBill","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"title","type":"string"},{"name":"to","type":"address"},{"name":"approver","type":"address"},{"name":"note","type":"string"},{"name":"endtime","type":"uint256"},{"name":"value","type":"uint256"}],"name":"newBill","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"bills","outputs":[{"name":"approved","type":"bool"},{"name":"approver","type":"address"},{"name":"starttime","type":"uint256"},{"name":"endtime","type":"uint256"},{"name":"value","type":"uint256"},{"name":"name","type":"bytes32"},{"name":"title","type":"string"},{"name":"note","type":"string"},{"name":"created","type":"address"},{"name":"owner","type":"address"},{"name":"status","type":"uint8"},{"name":"isclosed","type":"bool"},{"name":"orderlen","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"getCountBill","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"approveCompany","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"_offerId","type":"uint256"}],"name":"cancelOrder","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"},{"name":"_a","type":"address"}],"name":"coinBalanceOf","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"getOrdersId","outputs":[{"name":"","type":"uint256[]"}],"type":"function"},{"constant":true,"inputs":[],"name":"getSender","outputs":[{"name":"_r","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_offerId","type":"uint256"}],"name":"matchOrder","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"canTrade","outputs":[{"name":"_r","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"isCompany","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"},{"name":"_proxy","type":"address"}],"name":"isApproved","outputs":[{"name":"_r","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"getBillsCount","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"val","type":"uint256"}],"name":"sendCNY","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"orders","outputs":[{"name":"creator","type":"address"},{"name":"billid","type":"uint256"},{"name":"rateValue","type":"uint256"},{"name":"createTime","type":"uint256"},{"name":"billname","type":"bytes32"},{"name":"tradeTime","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"getCount","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"coins","outputs":[{"name":"starttime","type":"uint256"},{"name":"endtime","type":"uint256"},{"name":"value","type":"uint256"},{"name":"name","type":"bytes32"},{"name":"title","type":"string"},{"name":"owner","type":"address"},{"name":"note","type":"string"},{"name":"status","type":"uint8"}],"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"rateValue","type":"uint256"}],"name":"placeOrder","outputs":[{"name":"_offerId","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"ids","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"companyList","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"bankList","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"coinBalance","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"},{"name":"hash","type":"bytes32"}],"name":"approveBank","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"isBank","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Sent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"id","type":"uint256"}],"name":"Create","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"rateValue","type":"uint256"}],"name":"CreateOrder","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"id","type":"uint256"}],"name":"CreateBill","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"id","type":"uint256"}],"name":"CloseBill","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"code","type":"uint256"}],"name":"Error","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"}],"name":"Approve","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"_offerId","type":"uint256"}],"name":"MatchOrder","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"_offerId","type":"uint256"}],"name":"CancelOrder","type":"event"}];

var address = "0xbe0d116ee3544c507f47cbff804b3664768b2ecf";

var coindbContract = web3.eth.contract(_jsonabi);
var coindb = coindbContract.at(address);

// ABI函数集合 
function abiFunSignature(coindb) {
	var coindbabis = coindb.abi;
	var coindbabiids = {};
	for (var i in coindbabis) {
		if (coindb[coindbabis[i].name] != undefined) {
			if ('signature' in coindb[coindbabis[i].name]) {
				coindbabiids[coindb[coindbabis[i].name].signature()] = coindbabis[i].name;
			}
		}
	}
	return coindbabiids;	
}

var txhash = '0xa2e9f135554d0d3190c6557172f58aae1d257592cf2fe9a788e5514ec3ea6a07';
var tx = web3.eth.getTransaction(txhash);
console.log(tx);
var receipt = web3.eth.getTransactionReceipt(txhash);

var input = tx.input;
var abiid = input.substr(2,8);
var coindbabiids = abiFunSignature(coindb);		
var abiname = coindbabiids[abiid];
//console.log(abiname);
var input_decode = coindb[abiname].unpackArgs(input);
console.log(input_decode);
for (var k = 0; k < receipt.logs.length; k++) {									
	coindb.decodeLog(receipt.logs[k]);
}	
console.log(receipt);

for(var i = 0; i < _jsonabi.length; i++) {
	if(_jsonabi[i].name == abiname) {
		console.log(_jsonabi[i]);
        if(_jsonabi[i].inputs.length != 0) {
			var str = _jsonabi[i].name+"<br>";
			for(var j = 0; j < _jsonabi[i].inputs.length; j++) {
				switch(_jsonabi[i].inputs[j].type) {
					case "uint256": 
					    input_decode[j] = input_decode[j].toNumber();
					break;
					case "bytes32": 
					   input_decode[j] = web3.toAscii(input_decode[j]);
					break;
				}								
				str += _jsonabi[i].inputs[j].name+":"+input_decode[j]+"<br>";				
			}
			str = str.substring(0, str.length-4);
			console.log(str);
		}
	}
}
var strs = "";
for (var k = 0; k < receipt.logs.length; k++) {	
	var log = receipt.logs[k];	
	for(var i = 0; i < _jsonabi.length; i++) {		
		if(_jsonabi[i].name == log.event) {
			var str = _jsonabi[i].name+"<br>";
			for(var j = 0; j < _jsonabi[i].inputs.length; j++) {
				//console.log("here");
				switch(_jsonabi[i].inputs[j].type) {
					case "uint256": 
					    log.args[_jsonabi[i].inputs[j].name] = log.args[_jsonabi[i].inputs[j].name].toNumber();
					break;
					case "bytes32": 
					    log.args[_jsonabi[i].inputs[j].name] = web3.toAscii(log.args[_jsonabi[i].inputs[j].name]);
					break;
				}								
				str += _jsonabi[i].inputs[j].name+":"+log.args[_jsonabi[i].inputs[j].name]+"<br>";	
			}			
			console.log(str);
		}		
		
	}
	strs += str;
}
console.log(strs);