var Bill = require('./Bill.js');
var Web3 = require('web3');
var web3 = new Web3();
var res = Bill.init();
var private = "123456789";
var randnum = "20161030";
var privateKey = Bill.getPrivkey(randnum,private);
console.log("private :"+privateKey);
var publicKey = Bill.getPublickey(privateKey);
console.log("public  : "+publicKey);
var adminKey = "1ad755f807ae64b50957f7e50ccac90c0506f369e95350eaf446a2931732bebb";
var nonce;

nonce = Bill.getNonce(publicKey);
console.log("nonce :"+nonce);

Bill.sendGas(adminKey,publicKey,100,function(err,res){
 	console.log(err);
 	console.log(res);
});

// Bill.setFeeRate(adminKey,100,function(err,res){
// 	console.log(err);
// 	console.log(res);
// });


// Bill.investorDeposit(adminKey,publicKey,100000,function(err,res){
// 	console.log(err);
// 	console.log(res);
// });
// 
// Bill.investorWithdraw(adminKey,publicKey,100000,function(err,res){
// 	console.log(err);
// 	console.log(res);
// });
// Bill.deposit(adminKey,publicKey,100000,function(err,res){
// 	console.log(err);
// 	console.log(res);
// });
// Bill.withdraw(adminKey,publicKey,100000,function(err,res){
// 	console.log(err);
// 	console.log(res);
// });
// 
// Bill.newBill(adminKey,publicKey,10000,9000,90,1477584000,1477756800,function(err,res){
// 	console.log(err);
// 	console.log(res);
// });
// 
// Bill.deposit(adminKey,1,10,function(err,res){
// 	console.log(err);
// 	console.log(res);
// });
//Bill.closeBill(adminKey,1,function(err,res){
//	console.log(err);
//	console.log(res);
//});
