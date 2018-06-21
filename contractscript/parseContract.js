var Web3 = require('web3');
var web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider("http://122.224.77.187:8545"));

var contractConfig = require('../config/contract.js');
var n128 = web3.toBigNumber(2).pow(128);
module.exports = ParseContract;

function ParseContract(tx){
	this.data = {};
	this.hash = tx.hash;

	this.parseTx = function(tx){
		var data = {input:"", receipt:""};
		var input = {};
		var receipt = [];
		var func = tx.func;
		tx.args = JSON.parse(tx.args);
		tx.logs = JSON.parse(tx.logs);
		if(func == 'sendCoin'){
			input = {Function:tx.func,name:"",amount:"",to:""};
			if(tx.args.length >0){
				input.name = web3.toAscii(tx.args[0].substr(2)).substr(0,3);
				input.amount = tx.args[1];
				input.to = tx.args[2];
			}
			if(tx.logs.length>0){
				for (var i = 0; i < tx.logs.length; i++) {
					var log = {Event:"",Index:"",Args:{}};
					if(tx.logs[i]['event'] == 'Deposit' || tx.logs[i]['event'] == 'Withdraw'){
						//console.log(tx.logs[i]['event']);
						tx.logs[i]['args']['currency'] = web3.toAscii(tx.logs[i]['args']['currency'].substr(2)).substr(0,3);
						log.Event = tx.logs[i]['event'];
						log.Index = tx.logs[i]['logIndex'];
						log.Args = tx.logs[i]['args'];
						receipt.push(log);
					}

				}
			}
		}else if (func == 'placeOrder'){
			input = {Function:tx.func,symbol:"",price:"",amount:"",isbuy:""};
			if(tx.args.length >0){
				input.symbol = web3.toAscii(tx.args[0].substr(2)).substr(0,6);
				input.price = tx.args[1];
				input.amount = tx.args[2];
				input.isbuy = tx.args[3];
			}
			if(tx.logs.length>0){
				console.log("logs length : "+tx.logs.length);
				for (var i = 0; i < tx.logs.length; i++) {
					var log = {Event:"",Index:"",Args:{}};
					if(tx.logs[i]['event'] != 'Error' || tx.logs[i]['event'] != 'ErrorInt'){

						if(tx.logs[i]['event'] == "OrderCreate"){
							tx.logs[i]['args']['pirceamount'] = web3.toBigNumber(tx.logs[i]['args']['pirceamount']);
							tx.logs[i]['args']['pirceamount'] = tx.logs[i]['args']['pirceamount'].divToInt(n128).toNumber()+", "+tx.logs[i]['args']['pirceamount'].mod(n128).toNumber();
						}else if(tx.logs[i]['event'] =="MtfEvent"){
							tx.logs[i]['args']['priceamount'] = web3.toBigNumber(tx.logs[i]['args']['priceamount']);
							tx.logs[i]['args']['offerIdwantId'] = web3.toBigNumber(tx.logs[i]['args']['offerIdwantId']);
							tx.logs[i]['args']['priceamount'] = tx.logs[i]['args']['priceamount'].divToInt(n128).toNumber()+", "+tx.logs[i]['args']['priceamount'].mod(n128).toNumber();
							tx.logs[i]['args']['offerIdwantId'] = tx.logs[i]['args']['offerIdwantId'].divToInt(n128).toNumber()+", "+tx.logs[i]['args']['offerIdwantId'].mod(n128).toNumber();
						}else if(tx.logs[i]['event'] =="UpdateWallet"){
							tx.logs[i]['args']['currency'] = web3.toAscii(tx.logs[i]['args']['currency'].substr(2)).substr(0,3);
						}else if(tx.logs[i]['event'] =="CancelOrderEvent"){
							tx.logs[i]['args']['priceamount'] = web3.toBigNumber(tx.logs[i]['args']['priceamount']);
							tx.logs[i]['args']['priceamount'] = tx.logs[i]['args']['priceamount'].divToInt(n128).toNumber()+", "+tx.logs[i]['args']['priceamount'].mod(n128).toNumber();
						}

						log.Event = tx.logs[i]['event'];
						log.Index = tx.logs[i]['logIndex'];
						log.Args = tx.logs[i]['args'];
						receipt.push(log);
					}

				}
			}
		}else if (func == 'cancelOrder'){
			input = {Function:tx.func,orderId:""};
			if(tx.args.length >0){
				input.orderId = tx.args[0];
			}
			if(tx.logs.length>0){
				for (var i = 0; i < tx.logs.length; i++) {
					var log = {Event:"",Index:"",Args:{}};
					if(tx.logs[i]['event'] != 'Error' || tx.logs[i]['event'] != 'ErrorInt'){
						if(tx.logs[i]['event'] == "OrderCreate"){
							tx.logs[i]['args']['pirceamount'] = web3.toBigNumber(tx.logs[i]['args']['pirceamount']);
							tx.logs[i]['args']['pirceamount'] = tx.logs[i]['args']['pirceamount'].divToInt(n128).toNumber()+", "+tx.logs[i]['args']['pirceamount'].mod(n128).toNumber();
						}else if(tx.logs[i]['event'] =="MtfEvent"){
							tx.logs[i]['args']['priceamount'] = web3.toBigNumber(tx.logs[i]['args']['priceamount']);
							tx.logs[i]['args']['offerIdwantId'] = web3.toBigNumber(tx.logs[i]['args']['offerIdwantId']);
							tx.logs[i]['args']['priceamount'] = tx.logs[i]['args']['priceamount'].divToInt(n128).toNumber()+", "+tx.logs[i]['args']['priceamount'].mod(n128).toNumber();
							tx.logs[i]['args']['offerIdwantId'] = tx.logs[i]['args']['offerIdwantId'].divToInt(n128).toNumber()+", "+tx.logs[i]['args']['offerIdwantId'].mod(n128).toNumber();
						}else if(tx.logs[i]['event'] =="UpdateWallet"){
							tx.logs[i]['args']['currency'] = web3.toAscii(tx.logs[i]['args']['currency'].substr(2)).substr(0,3);
						}else if(tx.logs[i]['event'] =="CancelOrderEvent"){
							tx.logs[i]['args']['priceamount'] = web3.toBigNumber(tx.logs[i]['args']['priceamount']);
							tx.logs[i]['args']['priceamount'] = tx.logs[i]['args']['priceamount'].divToInt(n128).toNumber()+", "+tx.logs[i]['args']['priceamount'].mod(n128).toNumber();
						}

						log.Event = tx.logs[i]['event'];
						log.Index = tx.logs[i]['logIndex'];
						log.Args = tx.logs[i]['args'];
						receipt.push(log);
					}

				}
			}
		}
		console.log('input : '+input.Function);
		data.input = input;
		data.receipt = receipt;
		return data;
	}

	this.run = function(){

		this.data = this.parseTx(tx);
		//console.log('data:'+JSON.stringify(this.data));
	}
	this.run();

}

function ParseContract1(hash){
	this.data = {};
	this.hash = hash;
	// 获取合约地址集合	
	this.getContractAddersses = function(){
		var contractAddersses = [];

		for(var key in contractConfig) {
			contractAddersses.push(key);
		}
		return contractAddersses;
	}
	// 获取合约属性对象
	this.getCoindb = function(contractAdderss) {
		return web3.eth.contract(contractConfig[contractAdderss].abiJson).at(contractAdderss);
	}
	// ABI函数集合 
	this.abiFunSignature = function(coindb) {
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
	// 解析input
    this.parseInput = function(coindb, input, abiJson) {
		var abiid = input.substr(2,8);
		var coindbabiids = this.abiFunSignature(coindb);		
		var abiname = coindbabiids[abiid];
		//console.log(abiname);
		var input_decode = coindb[abiname].unpackArgs(input);

		for(var i = 0; i < abiJson.length; i++) {
			if(abiJson[i].name == abiname) {
		        if(abiJson[i].inputs.length != 0) {
					var str = "<b>Function:" + abiJson[i].name+"</b><br>";
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
					//console.log(str);
				}
			}
		}
		return str;
	}
	// 解析receiptLogs
	this.pareseReceiptLogs = function(coindb, receipt, abiJson) {
		for (var k = 0; k < receipt.logs.length; k++) {									
			coindb.decodeLog(receipt.logs[k]);
		}

		var strs = "";
		for (var k = 0; k < receipt.logs.length; k++) {	
			var log = receipt.logs[k];	
			for(var i = 0; i < abiJson.length; i++) {		
				if(abiJson[i].name == log.event) {
					var str = "<b>Event:" + abiJson[i].name+"</b> Index:"+k+"<br>";
					for(var j = 0; j < abiJson[i].inputs.length; j++) {
						//console.log("here");
						switch(abiJson[i].inputs[j].type) {
							case "uint256": 
							    if(abiJson[i].inputs[j].name === "pirceamount" || abiJson[i].inputs[j].name === "priceamount" || abiJson[i].inputs[j].name === "offerIdwantId") {
							    	log.args[abiJson[i].inputs[j].name] = log.args[abiJson[i].inputs[j].name].divToInt(n128).toNumber()+","+log.args[abiJson[i].inputs[j].name].mod(n128).toNumber();
							    } else {
							    	log.args[abiJson[i].inputs[j].name] = log.args[abiJson[i].inputs[j].name].toNumber();
							    }								    
							break;
							case "bytes32": 
							    log.args[abiJson[i].inputs[j].name] = web3.toAscii(log.args[abiJson[i].inputs[j].name]);
							break;
						}								
						str += abiJson[i].inputs[j].name+":"+log.args[abiJson[i].inputs[j].name]+"<br>";	
					}			
					//console.log(str);
				}		
			}
			strs += str;
		}
		//console.log(strs);
		return strs;
	}
	
	this.run = function() {
		var tx = web3.eth.getTransaction(hash);
		var data = {input:"", receipt:""};
		if(this.getContractAddersses().indexOf(tx.to) != "-1") {
			
			var abiJson = contractConfig[tx.to].abiJson;
			var coindb = this.getCoindb(tx.to);
			var input = tx.input;
			data.input = this.parseInput(coindb, input, abiJson);

			var receipt = web3.eth.getTransactionReceipt(hash);
			data.receipt = this.pareseReceiptLogs(coindb, receipt, abiJson);
			
		}
		 this.data = data;
	}

	this.run();
}


// var ParseContract = {
// 	createNew : function() {
// 		var pc = {};
// 		// 获取合约地址集合	
// 		pc.getContractAddersses = function(){
// 			var contractAddersses = [];
// 			for(var key in contractConfig) {
// 				contractAddersses.push(key);
// 			}
// 			return contractAddersses;
// 		}
// 		// 获取合约属性对象
// 		pc.getCoindb = function(contractAdderss) {
// 			return web3.eth.contract(contractConfig[contractAdderss].abiJson).at(contractAdderss);
// 		}
// 		// ABI函数集合 
// 		pc.abiFunSignature = function(coindb) {
// 			var coindbabis = coindb.abi;
// 			var coindbabiids = {};
// 			for (var i in coindbabis) {
// 				if (coindb[coindbabis[i].name] != undefined) {
// 					if ('signature' in coindb[coindbabis[i].name]) {
// 						coindbabiids[coindb[coindbabis[i].name].signature()] = coindbabis[i].name;
// 					}
// 				}
// 			}
// 			return coindbabiids;	
// 		}
// 		// 解析input
//         pc.parseInput = function(coindb, input, abiJson) {
// 			var abiid = input.substr(2,8);
// 			var coindbabiids = pc.abiFunSignature(coindb);		
// 			var abiname = coindbabiids[abiid];
// 			//console.log(abiname);
// 			var input_decode = coindb[abiname].unpackArgs(input);

// 			for(var i = 0; i < abiJson.length; i++) {
// 				if(abiJson[i].name == abiname) {
// 			        if(abiJson[i].inputs.length != 0) {
// 						var str = "<b>Function:" + abiJson[i].name+"</b><br>";
// 						for(var j = 0; j < abiJson[i].inputs.length; j++) {
// 							switch(abiJson[i].inputs[j].type) {
// 								case "uint256": 
// 								    input_decode[j] = input_decode[j].toNumber();
// 								break;
// 								case "bytes32": 
// 								   input_decode[j] = web3.toAscii(input_decode[j]);
// 								break;
// 							}								
// 							str += abiJson[i].inputs[j].name+":"+input_decode[j]+"<br>";				
// 						}
// 						str = str.substring(0, str.length-4);
// 						console.log(str);
// 					}
// 				}
// 			}
// 			return str;
// 		}
// 		// 解析receiptLogs
//  		pc.pareseReceiptLogs = function(coindb, receipt, abiJson) {
// 			for (var k = 0; k < receipt.logs.length; k++) {									
// 				coindb.decodeLog(receipt.logs[k]);
// 			}

// 			var strs = "";
// 			for (var k = 0; k < receipt.logs.length; k++) {	
// 				var log = receipt.logs[k];	
// 				for(var i = 0; i < abiJson.length; i++) {		
// 					if(abiJson[i].name == log.event) {
// 						var str = "<b>Event:" + abiJson[i].name+"</b> Index:"+k+"<br>";
// 						for(var j = 0; j < abiJson[i].inputs.length; j++) {
// 							//console.log("here");
// 							switch(abiJson[i].inputs[j].type) {
// 								case "uint256": 
// 								    if(abiJson[i].inputs[j].name === "pirceamount" || abiJson[i].inputs[j].name === "priceamount" || abiJson[i].inputs[j].name === "offerIdwantId") {
// 								    	log.args[abiJson[i].inputs[j].name] = log.args[abiJson[i].inputs[j].name].divToInt(n128).toNumber()+","+log.args[abiJson[i].inputs[j].name].mod(n128).toNumber();
// 								    } else {
// 								    	log.args[abiJson[i].inputs[j].name] = log.args[abiJson[i].inputs[j].name].toNumber();
// 								    }								    
// 								break;
// 								case "bytes32": 
// 								    log.args[abiJson[i].inputs[j].name] = web3.toAscii(log.args[abiJson[i].inputs[j].name]);
// 								break;
// 							}								
// 							str += abiJson[i].inputs[j].name+":"+log.args[abiJson[i].inputs[j].name]+"<br>";	
// 						}			
// 						//console.log(str);
// 					}		
// 				}
// 				strs += str;
// 			}
// 			console.log(strs);
// 			return strs;
// 		}
		
// 		pc.run = function(hash) {
// 			var tx = web3.eth.getTransaction(hash);
// 			var data = {input:"", receipt:""};
// 			if(pc.getContractAddersses().indexOf(tx.to) != "-1") {
// 				var abiJson = contractConfig[tx.to].abiJson;

// 				var coindb = pc.getCoindb(tx.to);
// 				var input = tx.input;
// 				data.input = pc.parseInput(coindb, input, abiJson);
	
// 				var receipt = web3.eth.getTransactionReceipt(hash);
// 				data.receipt = pc.pareseReceiptLogs(coindb, receipt, abiJson);
				
// 			}
// 			return data;
// 		}

// 		return pc;
// 	}
//}
