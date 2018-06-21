//process.env.DEBUG = "*";
var cluster = require('cluster');
var http = require('http');
var async = require('async');
var request = require('request');
var workers = 1
if (cluster.isMaster) {
    console.log('start cluster with %s workers', workers);
    for (var i = 0; i < workers; ++i) {
        var worker = cluster.fork().process;
        console.log('worker %s started.', worker.pid);
    }
    cluster.on('exit', function(worker) {
        console.log('worker %s died. restart...', worker.process.pid);
        cluster.fork();
    });
} else {
    var dbConfig = require('./config/db.js');
    var Dbobject = require('./lib/poolClient.js');
    var DB = new Dbobject(dbConfig.pooldb_eth);
    DB.createPool();
    var Web3 = require('web3');
    var web3 = new Web3();
    //var request = require('sync-request');
    var EthTx = require('ethereumjs-tx');

    web3.setProvider(new web3.providers.HttpProvider("http://122.224.124.250:38545"));//http://10.25.72.133:8545
    var from = web3.eth.accounts[0];
    web3.eth.defaultAccount = from;

    //var _jsonabi =[{"constant":true,"inputs":[{"name":"name","type":"bytes33"}],"name":"isInit","outputs":[{"name":"_r","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"note","type":"string"},{"name":"value","type":"uint256"}],"name":"newCoin","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"}],"name":"cancelOrder","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"status","outputs":[{"name":"_r","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"},{"name":"_a","type":"address"}],"name":"coinBalanceOf","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"canTrade","outputs":[{"name":"_r","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"getOrderCount","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"},{"name":"_a","type":"address"}],"name":"coinFrozenOf","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"symbols","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"getCount","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"symbol","type":"bytes32"},{"name":"price","type":"uint256"},{"name":"amount","type":"uint256"},{"name":"isbuy","type":"bool"}],"name":"placeOrder","outputs":[{"name":"_offerId","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"limit","type":"uint256"}],"name":"bytes32arr","outputs":[{"name":"ok","type":"bool"},{"name":"buy","type":"uint256[]"},{"name":"sell","type":"uint256[]"}],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"approveBank","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"coins","outputs":[{"name":"value","type":"uint256"},{"name":"name","type":"bytes32"},{"name":"note","type":"string"},{"name":"owner","type":"address"},{"name":"status","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"ids","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"bankList","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"first","type":"bytes32"},{"name":"second","type":"bytes32"}],"name":"newsymbol","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"coinBalance","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"symbol","type":"bytes32"},{"name":"limit","type":"uint256"}],"name":"marketInfo","outputs":[{"name":"ok","type":"bool"},{"name":"buy","type":"uint256[]"},{"name":"sell","type":"uint256[]"}],"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"_val","type":"uint256"},{"name":"_to","type":"address"}],"name":"sendCoin","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"isBank","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"code","type":"bytes32"}],"name":"Error","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"code","type":"bytes32"},{"indexed":false,"name":"a","type":"uint256"},{"indexed":false,"name":"b","type":"uint256"}],"name":"ErrorInt","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"id","type":"uint256"}],"name":"CreateCoin","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"}],"name":"CreateSymbol","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"}],"name":"CreateMatch","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"bank","type":"address"}],"name":"ApproveBank","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"mtfId","type":"uint256"},{"indexed":false,"name":"offerIdwantId","type":"uint256"},{"indexed":false,"name":"priceamount","type":"uint256"}],"name":"MtfEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"offerId","type":"uint256"},{"indexed":false,"name":"pirceamount","type":"uint256"}],"name":"OrderCreate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"bankaddr","type":"address"},{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"currency","type":"bytes32"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"bankaddr","type":"address"},{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"currency","type":"bytes32"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"addr","type":"address"},{"indexed":false,"name":"currency","type":"bytes32"},{"indexed":false,"name":"amount","type":"int256"},{"indexed":false,"name":"frozen","type":"int256"}],"name":"UpdateWallet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"priceamount","type":"uint256"}],"name":"CancelOrderEvent","type":"event"}]
    var _jsonabi = [{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"isInit","outputs":[{"name":"_r","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"isAdmin","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"n","type":"uint256"}],"name":"toBytes32BigE","outputs":[{"name":"out","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"adminList","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"note","type":"string"},{"name":"value","type":"uint256"}],"name":"newCoin","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"s1","type":"bytes32"},{"name":"s2","type":"bytes32"}],"name":"concatsymbol","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"uids","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"}],"name":"cancelOrder","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"status","outputs":[{"name":"_r","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"},{"name":"_a","type":"address"}],"name":"coinBalanceOf","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"approveAdmin","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"canTrade","outputs":[{"name":"_r","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"getOrderCount","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"matches","outputs":[{"name":"symbol","type":"bytes32"},{"name":"first","type":"bytes32"},{"name":"second","type":"bytes32"},{"name":"buyskip","type":"bytes32"},{"name":"sellskip","type":"bytes32"},{"name":"mtfqueue","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"},{"name":"_a","type":"address"}],"name":"coinFrozenOf","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"symbols","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"orders","outputs":[{"name":"creator","type":"address"},{"name":"symbol","type":"bytes32"},{"name":"oamount","type":"uint256"},{"name":"price","type":"uint256"},{"name":"amount","type":"uint256"},{"name":"isbuy","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"getCount","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"newaddr","type":"address"},{"name":"oldaddr","type":"address"}],"name":"resetAccount","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"symbol","type":"bytes32"},{"name":"price","type":"uint256"},{"name":"amount","type":"uint256"},{"name":"isbuy","type":"bool"}],"name":"placeOrder","outputs":[{"name":"_offerId","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"limit","type":"uint256"}],"name":"bytes32arr","outputs":[{"name":"ok","type":"bool"},{"name":"buy","type":"uint256[]"},{"name":"sell","type":"uint256[]"}],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"approveBank","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"coins","outputs":[{"name":"value","type":"uint256"},{"name":"name","type":"bytes32"},{"name":"note","type":"string"},{"name":"owner","type":"address"},{"name":"status","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"ids","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"bankList","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"first","type":"bytes32"},{"name":"second","type":"bytes32"}],"name":"newsymbol","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"coinBalance","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"symbol","type":"bytes32"},{"name":"limit","type":"uint256"}],"name":"marketInfo","outputs":[{"name":"ok","type":"bool"},{"name":"buy","type":"uint256[]"},{"name":"sell","type":"uint256[]"}],"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"_val","type":"uint256"},{"name":"_to","type":"address"}],"name":"sendCoin","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"isBank","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"},{"name":"uid","type":"uint256"}],"name":"setUid","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"val","type":"uint256"}],"name":"addBalance","outputs":[],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"val","type":"uint256"}],"name":"AddBalance","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"code","type":"bytes32"}],"name":"Error","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"code","type":"bytes32"},{"indexed":false,"name":"a","type":"uint256"},{"indexed":false,"name":"b","type":"uint256"}],"name":"ErrorInt","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"id","type":"uint256"}],"name":"CreateCoin","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"}],"name":"CreateSymbol","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"}],"name":"CreateMatch","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"bank","type":"address"}],"name":"ApproveBank","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"bank","type":"address"}],"name":"ApproveAdmin","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"uid","type":"uint256"}],"name":"SetUidEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"newaddr","type":"address"},{"indexed":false,"name":"oldaddr","type":"address"},{"indexed":false,"name":"uid","type":"uint256"}],"name":"ResetAccount","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"mtfId","type":"uint256"},{"indexed":false,"name":"offerIdwantId","type":"uint256"},{"indexed":false,"name":"priceamount","type":"uint256"}],"name":"MtfEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"offerId","type":"uint256"},{"indexed":false,"name":"pirceamount","type":"uint256"}],"name":"OrderCreate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"bankaddr","type":"address"},{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"currency","type":"bytes32"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"bankaddr","type":"address"},{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"currency","type":"bytes32"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"addr","type":"address"},{"indexed":false,"name":"currency","type":"bytes32"},{"indexed":false,"name":"amount","type":"int256"},{"indexed":false,"name":"frozen","type":"int256"}],"name":"UpdateWallet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"priceamount","type":"uint256"}],"name":"CancelOrderEvent","type":"event"}];
    var coindbContract = web3.eth.contract(_jsonabi);

    var address = "0xb10862b9f9d15a18c72ed31afdd4a069daaf9329";//"0x6d6e93e94aec5d323d049873db93a1a6d6953518"  "0x15b0dbb2b85c80c7306b360df6c467632d5b0eb1";//"0x2e347ef1b9b036ceb3d2733afb63a3c3fc5cb79e";
    var coindb = coindbContract.at(address);

    function initNonce(key) {
        nonce = web3.eth.getTransactionCount(key);
        return "0x" + nonce.toString(16)
    }

    var privateKey1 = new Buffer('465e78c3e07cce0f6f364030f7bc29a59adb31b1756d107724158248e571df46', 'hex') //e0d0b015327b8d4b1874c921fa5cd3b2e1efb3d86c63479a08918d5c7ce90743
        var from1 = "0x" + ethUtil.privateToAddress(privateKey1).toString("hex"); //"0xd502045538d57f800b59d25ef1f20adb05197493";//
    console.log(from1)
        var NewCoin = require('./Coin.js');
    NewCoin.init();
    var nonce;

    initNonce(from1);
    console.log(from1);
    var gasLimit = 1000000;
    var gasPrice = 21783080000;
    var topPrice = 870;
    var lowerPrice = 720;
    var basePrice = 800;
    var range = 10;
    var eachNums =1000;
    run2();
    function run1(){
        var p = randInt(750,100);
        console.log(p/10);
        setTimeout(run,1000);
    }

    function run2(){
        request.post({url:'http://122.224.124.250:9081/bulkstock/default/tickoil', form: {key:'value'}}, function(err,httpResponse,body){ 
                if(err){
                    console.log(err);
                    setTimeout(run,1000);
                }
                body = JSON.parse(body);
                parseData(body);
                })
    }
    function parseData(body){
        var trade = body.trade;
        var selllist = body.marketdata.sell;
        var buylist = body.marketdata.buy;
        var lastPrice = 0;
        var sellone = 0;
        var buyone = 0;
        var alllist = [];
        var placeorders = [];
        if(trade.length>0){
            lastPrice = trade[0].price;
            console.log('lastPrice : '+lastPrice);
        }
        if(selllist.length>0){
            sellone = selllist[0].price;
            console.log('sellone : '+sellone);
        }

        if(buylist.length>0){
            buyone = buylist[0].price;
            console.log('buyone : '+buyone);
        }
        if(lastPrice ==0){
            lastPrice = basePrice / 10;
        }
        //无买单和卖单
        if(buyone == 0 && sellone == 0){
            alllist = getPlaceOrder(lastPrice,10);
        }else if(buyone == 0 && sellone >0){//无买单
            alllist = getPlaceOrder(lastPrice,1);
        }else if(buyone >0 && sellone ==0){//无卖单
            alllist = getPlaceOrder(lastPrice,0);
        }else{//买单卖单都有
            alllist = getPlaceOrder(lastPrice,2);
        }
        console.log(alllist);

        async.eachSeries(alllist,function(order,callback){
            if(order.type == 1){
                NewCoin.placeOrder(privateKey1,'OILCNY',order.price*100000000,randInt(0,3)*100000000,true);
            }else if(order.type == 0){
                NewCoin.placeOrder(privateKey1,'OILCNY',order.price*100000000,randInt(0,3)*100000000,false);
            }
        },function(err){
            console.log(err);	
            setTimeout(run2,2000);
        })
    }

    function getPlaceOrder(price,type){
        var list = [];
        price = parseInt(price);
        if(type == 1){
            for(var i=0;i<10;i++ ){
                var order = {price:'',type:''};
                order.price = formatFloat(((price-(i+1))*10000000),0);
                order.type = type;
                list.push(order);
            }
        }else if(type == 0){
            for(var i = 0;i<10;i++){
                var order = {price:'',type:''};
                order.price = formatFloat(((price+(i+1))*10000000),0);
                order.type = type;
                list.push(order);
            }	
        }else if(type == 2){
            for(var i = 0;i<5;i++){
                var order = {price:'',type:''};
                order.price = formatFloat(((price-(i+1))*10000000),0);
                order.type = 1;
                list.push(order);
            }

            for(var i = 0;i<5;i++){
                var order = {price:'',type:''};
                order.price = formatFloat(((price+(i+1))*10000000),0);
                order.type = 0;
                list.push(order);
            }
        }else if(type == 10){
            for(var i = 0;i<10;i++){
                var order = {price:'',type:''};
                order.price = formatFloat(((price-(i+1))*10000000),0);
                order.type = 1;
                list.push(order);
            }

            for(var i = 0;i<10;i++){ 
                var order = {price:'',type:''};
                order.price = formatFloat(((price+(i+1))*10000000),0);
                order.type = 0;
                list.push(order);
            }
        }

        return list;
    }


    function formatFloat(src, pos)
    {
        var num = Math.round(src*Math.pow(10, pos))/Math.pow(10, pos);
        return num; 
    }

    function run(){
        DB.findOne('trade_matches','cost_price,amount',callBackLoop,{'condition':'symbol=4','order':'matchtime desc','limit':'1'});//石油最新成交单子
    }

    function callBackLoop(row){
        console.log(row);
        if(row.length!=0 && row.cost_price != 'undefined' && row.amount != 'undefined'){
            lastPrice = row.cost_price/row.amount;
        }else{
            lastPrice = 0;
        }
        console.log(lastPrice);	
        DB._pool.getConnection(function(err,connection){
            if(err){
                console.log(err);
            }
            connection.query('(SELECT * FROM `trade_market` where ty = 0 and currency = 4 and amount >0 ORDER BY price asc limit 10) UNION (SELECT * FROM `trade_market` where ty = 1 and currency = 4 and amount > 0 ORDER BY price desc limit 10)',function(error,rows){
                if(error){
                    console.log(error);
                }

                var sellAmount = 0;
                var buyAmount = 0;
                var avaiableSellPriceList = [];
                var avaiableBuyPriceList = [];
                for(var i =0;i<rows.length;i++){
                    if(rows[i].ty == 1){
                        buyAmount += rows[i].amount/100000000;
                        if((rows[i].amount/100000000)<eachNums){
                            avaiableBuyPriceList.push(rows[i].price);
                        }
                    }else{
                        sellAmount += rows[i].amount/100000000;
                        if((rows[i].amount/100000000)<eachNums){
                            avaiableSellPriceList.push(rows[i].price);
                        }
                    }				
                }
                console.log(avaiableSellPriceList);
                console.log('sellamount : '+ sellAmount);
                console.log(avaiableBuyPriceList);
                console.log('buyamount : '+buyAmount);


            })
        })
        //randOrder(lastPrice);
    }




    function randOrder(lastPrice) {
        var price;
        if(lastPrice<=topPrice && lastPrice >= lowerPrice){
            price = randInt(lowerPrice,(topPrice-lowerPrice));
        }else{
            price = randInt(basePrice,range);
        }



        var symbol = "OILCNY"
            console.log('price'+price);
        if (0 && price % 2 == 0) {
            sellorder(symbol,price, function(err, hash) {
                var dd = new Date();
                console.log(dd.toLocaleTimeString(),":",dd.getMilliseconds(),"sell",price , err, hash);
            })
        } else {
            buyorder(symbol,80, function(err, hash) {
                var dd = new Date();
                console.log(dd.toLocaleTimeString(),":",dd.getMilliseconds(),"buy",price , err, hash);
            })
        }
        setTimeout(randOrder, 5000)//5000
    }




    function randInt(base,range) {
        var t = Math.floor(range * Math.random());
        console.log("rand",t);
        return base +t;
    }

    function buyorder(symbol ,price, callback) {
        var ethcount = (randInt() % 10 + 1)* 100000000;  //;2* 100000000 //
        var cost = price * 100000000 ;//5*100000000//
        console.log("buy",symbol,cost, ethcount);
        var tx = coindb.placeOrder.createTransaction(symbol,cost, ethcount,true);
        tx["nonce"] = nonce;
        nonce++;
        tx["gasPrice"] = "0x" + gasPrice.toString(16);
        tx["gasLimit"] = "0x" + gasLimit.toString(16);
        var tx = new EthTx(tx);
        tx.sign(privateKey1);
        var txstr = tx.serialize().toString("hex");
        web3.eth.sendRawTransaction(txstr, callback);
    }

    function sellorder(symbol,price, callback) {
        var ethcount = (randInt() % 10 + 1) * 100000000;//2*100000000//
        var cost =  price * 100000000;//5*100000000//
        //var tx = coindb.placeOrder.createTransaction("ETH", ethcount, "CNY", cost);
        console.log("sell",symbol,cost, ethcount);

        var tx = coindb.placeOrder.createTransaction(symbol,cost, ethcount,false);
        tx["nonce"] = nonce;
        nonce++;
        tx["gasPrice"] = "0x" + gasPrice.toString(16);
        tx["gasLimit"] = "0x" + gasLimit.toString(16);
        var tx = new EthTx(tx);
        tx.sign(privateKey1);
        var txstr = tx.serialize().toString("hex");
        web3.eth.sendRawTransaction(txstr, callback);
    }
}

