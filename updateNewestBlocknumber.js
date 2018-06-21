var dbConfig = require('./config/db.js');
var Dbobject = require('./lib/poolClient.js');
var DB = new Dbobject(dbConfig.pooldb_btc);
DB.createPool();
// web3
var Web3 = require('web3');
var web3 = new Web3();
//web3.setProvider(new web3.providers.HttpProvider("http://122.224.124.250:8545"));
web3.setProvider(new web3.providers.HttpProvider("http://eth.bityuan.com:80"));
var contractConfig = require('./config/contract_btc.js');

var providers = ["http://120.27.238.42:8545","http://120.27.209.242:8545","http:/121.196.193.209:8545","http://121.196.195.46:8545"];
var newestProviders = "";
var topNumber = 0;

    for(var i=0; i < providers.length;i++){
        web3.setProvider(new web3.providers.HttpProvider(providers[i]));
        try{
            var top = web3.eth.blockNumber;
            console.log("top :"+top);
            if(top != "undefined"){
                if(top > topNumber){
                    newestProviders = providers[i];
                    topNumber = top;
                }   
            }   
        }catch(err){
            console.log(providers[i]+" is not usefull");
        }   
    }   

    console.log(topNumber,newestProviders);
    web3 = new Web3(new Web3.providers.HttpProvider(newestProviders));







// 获取配置合约地址集合   
function getContractAddersses() {
    var contractAddersses = [];
    for(var key in contractConfig) {
        contractAddersses.push(key);
    }
    return contractAddersses;
}
var coindbCache = {}
// 获取合约属性对象
function getCoindb(contractAdderss) {
    if (coindbCache[contractAdderss]) {
        return coindbCache[contractAdderss];
    }
    var coindb = web3.eth.contract(contractConfig[contractAdderss].abiJson).at(contractAdderss);
    coindb.abimap = getAbiFunIndexes(coindb);
    coindbCache[contractAdderss] = coindb;
}
// ABI函数集合 
function getAbiFunIndexes(coindb) {
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
run();

function run(){
    DB.findOne("trade_config", "value", getLoopStartBlock, {'condition':"name='newestBlocknumber'"});

}
function getLoopStartBlock(row) {
    //console.log(row);
    if(row.length != 0 && row.value != "undefined") {
        var top = web3.eth.blockNumber;
        DB.update("trade_config",{"value":top},updateRes,{'condition':"name='newestBlocknumber'"})		
    } else {
        insertConfig();
        setTimeout(function(){
            run()
        },1000)
    }
}


function insertConfig() {
    var insertData = {
        name : "newestBlocknumber",
        value : "0",
    };
    DB.insert("trade_config", insertData);	
}

function updateRes(row){
    console.log(row);
    setTimeout(run,2000);
}
