/*var cluster = require('cluster');
  var http=require('http');
  var url = require('url');
  var cpu_num = require('os').cpus().length;
  var cpu_num = 4;
  var Web3 = require('web3');
  var web3 = new Web3();
  web3.setProvider(new web3.providers.HttpProvider("http://192.168.1.33:8545"));
  var contractConfig = require('./config/contract.js');
  function getContractAddersses() {
  var contractAddersses = [];
  for(var key in contractConfig) {
  contractAddersses.push(key);
  }
  return contractAddersses;
  }
  var coindbCache = {}
  function getCoindb(contractAdderss) {
  if (coindbCache[contractAdderss]) {
  return coindbCache[contractAdderss];
  }
  var coindb = web3.eth.contract(contractConfig[contractAdderss].abiJson).at(contractAdderss);
  coindb.abimap = getAbiFunIndexes(coindb);
  coindbCache[contractAdderss] = coindb;
  }
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
  var address = '0xb10862b9f9d15a18c72ed31afdd4a069daaf9329';
  var coindb = getCoindb(address);
  if (cluster.isMaster) {
  console.log("==启动主进程==");

  for (var i = 0; i < cpu_num; i++) {
  cluster.fork();
  }

  cluster.on('listening',function(worker,address){
  console.log('listening: worker ' + worker.process.pid);
  });

  cluster.on('exit', function(worker, code, signal) {
  console.log('exit worker ' + worker.process.pid + ' died');
  });
  } else {
  http.createServer(function(req, res) {
  var arg = url.parse(req.url).query;
  res.writeHead(200,{"Content-Type":"text/json"});
  if (req.method.toUpperCase() == 'POST') {
  var postData = [];
  req.addListener("data", function (data) {
  postData.push(data);
  });
  req.addListener("end", function () {
  var data = Buffer.concat(postData).toString();
  var params= JSON.parse(data);
  var log = params['log'];
  console.log(cluster.worker.id);
  console.log(params);
  res.end(log);
  })
  }
}).listen(8888);
}*/





var Web3 = require('web3');
var web3 = new Web3();
var async = require('async');
var log4js = require('log4js');
var log4js_conf = require('./log4js.json');
log4js.configure(log4js_conf);
var logger = log4js.getLogger('log_date');
logger.info('server is running ');
//web3.setProvider(new web3.providers.HttpProvider("http://eth.bityuan.com"));
//web3.setProvider(new web3.providers.HttpProvider("http://120.27.238.42:8545"));
//web3.setProvider(new web3.providers.HttpProvider("http://120.27.209.242:8545"));
//web3.setProvider(new web3.providers.HttpProvider("http://121.196.193.209:8545"));
//web3.setProvider(new web3.providers.HttpProvider("http://121.196.195.46:8545"));
//web3.setProvider(new web3.providers.HttpProvider("http://121.43.178.240:8545"));
var contractConfig = require('./config/contract_test.js');
//console.log(web3.eth.blockNumber);
var newestProviders = "";
var topNumber = 0;
var stime = new Date().getTime();
var providers = ["http://120.27.238.42:8545","http://120.27.209.242:8545","http:/121.196.193.209:8545","http://121.196.195.46:8545"];
for(var i=0; i < providers.length;i++){
    console.log(providers[i]);
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

        console.log(err);
    }
}
console.log(topNumber,newestProviders);
//var t1 = web3.eth.getBlock(831265);
//console.log(t1);
web3.setProvider(new web3.providers.HttpProvider(newestProviders));
var etime = new Date().getTime();
console.log(web3.eth.blockNumber,"token time "+(etime-stime));
var b = web3.eth.getTransaction("0x25b2c7a8fbd6bc2952f5336768fd86384685d794d88ad148f6b3b0e5918d1c08");
console.log(b);
return;

function getContractAddersses() {
    var contractAddersses = [];
    for(var key in contractConfig) {
        contractAddersses.push(key);
    }
    return contractAddersses;
}
var coindbCache = {}

function getCoindb(contractAdderss) {
    if (coindbCache[contractAdderss]) {
        return coindbCache[contractAdderss];
    }
    var coindb = web3.eth.contract(contractConfig[contractAdderss].abiJson).at(contractAdderss);
    coindb.abimap = getAbiFunIndexes(coindb);
    coindbCache[contractAdderss] = coindb;
}

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



console.log("newest blocknumber :"+web3.eth.blockNumber);
var list = [649200,649201,649202,649203,649204,649205,649206,649207,649208];
async.eachSeries(list,function(item,callback){
    var stime = new Date().getTime();
    console.log(item);
    web3.eth.getBlock(item,true,function(err,block){
        if(err) {
            console.log(err);
            console.log(item+" is pendding!");
            callback(err,item);
        }
        var etim = new Date().getTime();
        parseBlock(block, function(berr,bresult){
            if(berr){
                console.log(berr);
                callback(berr,block);
            }
            var etime = new Date().getTime();
            console.log(item+"----- time----"+(etime-etim)+"---------get-------"+(etim-stime));
            callback(null,block);
        });

    })
},function(err){
    console.log(err);
    console.log("end");
})

function parseBlock(block,bcallback) {
    console.log('----start----');
    var txs = block.transactions;
    var receipts = block.receipts;
    var timestamp = block.timestamp;
    var number = block.number;
    var log_list = [];
    var contractAdderss = '';
    for (var j = 0; j < txs.length; j++) {
        if(getContractAddersses().indexOf(txs[j].to) == "-1") {
        } else {
            contractAdderss = txs[j].to;
        }
    }
    if(contractAdderss.substr(0,2) == '0x'){
        var coindb = getCoindb(contractAdderss);
    }
    console.log(txs.length);
    for (var j = 0; j < txs.length; j++) {
        if(getContractAddersses().indexOf(txs[j].to) == "-1") {
            console.log(" no contract  address in config like "+txs[j].to)
        } else {
            var inputDecode = parseTxInputNew(txs[j].to, txs[j].input);
            txs[j]["func"] = inputDecode["func"];
            txs[j]["args"] = inputDecode["args"];
            var coindb = getCoindb(txs[j].to);
            if(receipts[j] != null){
                var tx = [];
                var tx_log = [];
                tx['input'] = inputDecode;
                if(tx['input']['func'] == "placeOrder"){
                    var currency = tx['input']['args'][0].substr(2);
                    currency = web3.toAscii(currency).substr(0,3);
                    var isbuy = tx['input']['args'][3];
                    var ty = 0;
                    if(isbuy){
                        ty = 1;
                    }
                }
                //for (var k = 0; k < receipts[j].logs.length; k++) {
                for (var k = 0; k < 10; k++) {
                    console.log(receipts[j].logs[k]);
                    return;
                    coindb.decodeLog(receipts[j].logs[k]);
                    /*var args = receipts[j].logs[k]['args'];
                      args['timestamp'] = timestamp;
                      if(receipts[j].logs[k]['event'] == "OrderCreate"){
                      args['type'] = currency;
                      args['ty'] = ty;
                      }
                      if(receipts[j].logs[k]['event'] == "UpdateWallet"
                      || receipts[j].logs[k]['event'] == "OrderCreate"
                      || receipts[j].logs[k]['event'] == "MtfEvent"
                      || receipts[j].logs[k]['event'] == "CancelOrderEvent"
                      || receipts[j].logs[k]['event'] == "Deposit"
                      || receipts[j].logs[k]['event'] == "Withdraw" ){
                      log_list.push(receipts[j].logs[k]);

                      }*/
                }
            }else{
                console.log('re is null');
            }



            }

        }
        console.log(log_list.length);
        console.log('----end----');
    }

    function parseTxInputNew(contractAdderss, input) {
        var coindb = getCoindb(contractAdderss);
        var matchname = coindb.abimap[input.slice(2, 10)];
        var match = coindb[matchname];
        var inputDecode = [];
        if (!match) {
            inputDecode["func"] = "null";
            inputDecode["args"] = null;
            console.log("func not match")
        } else {
            inputDecode["func"] = matchname;
            inputDecode["args"] = match.unpackArgs(input);
        }
        return inputDecode;
    }
