var Web3 = require('web3');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider("http://112.124.0.115:8545"));

// 合约地址配置
var contractConfig = require('./config/viewcontract.js');
//console.log(getContractAddersses());
// 获取合约地址	
function getContractAdderss(address) {
	return address;
}
// 获取合约地址集合	
function getContractAddersses() {
	var contractAddersses = [];
	for(var key in contractConfig) {
		contractAddersses.push(key);
	}
	return contractAddersses;
}
// 获取合约属性对象
function getCoindb(contractAdderss) {
	return web3.eth.contract(contractConfig[contractAdderss].abiJson).at(contractAdderss);
}
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

if(getContractAddersses().indexOf(tx.to) != "-1") {
	var abiJson = contractConfig[tx.to].abiJson;

	var coindb = getCoindb(tx.to);
	var input = tx.input;
	parseInput(coindb, input, abiJson);

	var receipt = web3.eth.getTransactionReceipt(txhash);
	pareseReceiptLogs(coindb, receipt, abiJson);

}
// 解析input
function parseInput(coindb, input, abiJson) {
	var abiid = input.substr(2,8);
	var coindbabiids = abiFunSignature(coindb);		
	var abiname = coindbabiids[abiid];
	//console.log(abiname);
	var input_decode = coindb[abiname].unpackArgs(input);

	for(var i = 0; i < abiJson.length; i++) {
		if(abiJson[i].name == abiname) {
	        if(abiJson[i].inputs.length != 0) {
				var str = abiJson[i].name+"<br>";
				for(var j = 0; j < abiJson[i].inputs.length; j++) {
					switch(abiJson[i].inputs[j].type) {
						case "uint256": 
						    input_decode[j] = input_decode[j].toNumber();
						break;
						case "bytes32": 
						   input_decode[j] = web3.toAscii(input_decode[j]);
						break;
					}								
					str += abiJson[i].inputs[j].name+":"+input_decode[j]+"<br>";				
				}
				str = str.substring(0, str.length-4);
				console.log(str);
			}
		}
	}
}
// 解析receiptLogs
function pareseReceiptLogs(coindb, receipt, abiJson) {
	for (var k = 0; k < receipt.logs.length; k++) {									
		coindb.decodeLog(receipt.logs[k]);
	}

	var strs = "";
	for (var k = 0; k < receipt.logs.length; k++) {	
		var log = receipt.logs[k];	
		for(var i = 0; i < abiJson.length; i++) {		
			if(abiJson[i].name == log.event) {
				var str = abiJson[i].name+"<br>";
				for(var j = 0; j < abiJson[i].inputs.length; j++) {
					//console.log("here");
					switch(abiJson[i].inputs[j].type) {
						case "uint256": 
						    log.args[abiJson[i].inputs[j].name] = log.args[abiJson[i].inputs[j].name].toNumber();
						break;
						case "bytes32": 
						    log.args[abiJson[i].inputs[j].name] = web3.toAscii(log.args[abiJson[i].inputs[j].name]);
						break;
					}								
					str += abiJson[i].inputs[j].name+":"+log.args[abiJson[i].inputs[j].name]+"<br>";	
				}			
				console.log(str);
			}		
		}
		strs += str;
	}
	console.log(strs);
}