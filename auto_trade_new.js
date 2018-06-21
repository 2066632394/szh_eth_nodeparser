var Web3 = require('web3');
var web3 = new Web3();
var Promise = require('promise');
var request = require('request');
var log4js = require('log4js');
var log4js_conf = require('./log4js.json');
log4js.configure(log4js_conf);
var logger = log4js.getLogger('log_date');
logger.info('server is running ');
var ethUtil = require('ethereumjs-util');
var EthTx =  require('ethereumjs-tx');
web3.setProvider(new web3.providers.HttpProvider("http://122.224.124.250:38545"));
var from = web3.eth.accounts[0];
web3.eth.defaultAccount = from;
web3.personal.unlockAccount(web3.eth.defaultAccount, "", 0);
var _jsonabi = [{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"isInit","outputs":[{"name":"_r","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"isAdmin","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"n","type":"uint256"}],"name":"toBytes32BigE","outputs":[{"name":"out","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"adminList","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"note","type":"string"},{"name":"value","type":"uint256"}],"name":"newCoin","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"s1","type":"bytes32"},{"name":"s2","type":"bytes32"}],"name":"concatsymbol","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"uids","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"id","type":"uint256"}],"name":"cancelOrder","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"status","outputs":[{"name":"_r","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"},{"name":"_a","type":"address"}],"name":"coinBalanceOf","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"approveAdmin","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"canTrade","outputs":[{"name":"_r","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"getOrderCount","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"matches","outputs":[{"name":"symbol","type":"bytes32"},{"name":"first","type":"bytes32"},{"name":"second","type":"bytes32"},{"name":"buyskip","type":"bytes32"},{"name":"sellskip","type":"bytes32"},{"name":"mtfqueue","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"},{"name":"_a","type":"address"}],"name":"coinFrozenOf","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"symbols","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"orders","outputs":[{"name":"creator","type":"address"},{"name":"symbol","type":"bytes32"},{"name":"oamount","type":"uint256"},{"name":"price","type":"uint256"},{"name":"amount","type":"uint256"},{"name":"isbuy","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"getCount","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"newaddr","type":"address"},{"name":"oldaddr","type":"address"}],"name":"resetAccount","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"symbol","type":"bytes32"},{"name":"price","type":"uint256"},{"name":"amount","type":"uint256"},{"name":"isbuy","type":"bool"}],"name":"placeOrder","outputs":[{"name":"_offerId","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"limit","type":"uint256"}],"name":"bytes32arr","outputs":[{"name":"ok","type":"bool"},{"name":"buy","type":"uint256[]"},{"name":"sell","type":"uint256[]"}],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"approveBank","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"coins","outputs":[{"name":"value","type":"uint256"},{"name":"name","type":"bytes32"},{"name":"note","type":"string"},{"name":"owner","type":"address"},{"name":"status","type":"uint8"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"ids","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"bankList","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"first","type":"bytes32"},{"name":"second","type":"bytes32"}],"name":"newsymbol","outputs":[{"name":"","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"name","type":"bytes32"}],"name":"coinBalance","outputs":[{"name":"_r","type":"uint256"}],"type":"function"},{"constant":true,"inputs":[{"name":"symbol","type":"bytes32"},{"name":"limit","type":"uint256"}],"name":"marketInfo","outputs":[{"name":"ok","type":"bool"},{"name":"buy","type":"uint256[]"},{"name":"sell","type":"uint256[]"}],"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"_val","type":"uint256"},{"name":"_to","type":"address"}],"name":"sendCoin","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"isBank","outputs":[{"name":"_success","type":"bool"}],"type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"},{"name":"uid","type":"uint256"}],"name":"setUid","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"val","type":"uint256"}],"name":"addBalance","outputs":[],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"val","type":"uint256"}],"name":"AddBalance","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"code","type":"bytes32"}],"name":"Error","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"code","type":"bytes32"},{"indexed":false,"name":"a","type":"uint256"},{"indexed":false,"name":"b","type":"uint256"}],"name":"ErrorInt","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"id","type":"uint256"}],"name":"CreateCoin","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"}],"name":"CreateSymbol","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"}],"name":"CreateMatch","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"bank","type":"address"}],"name":"ApproveBank","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"bank","type":"address"}],"name":"ApproveAdmin","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"uid","type":"uint256"}],"name":"SetUidEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"newaddr","type":"address"},{"indexed":false,"name":"oldaddr","type":"address"},{"indexed":false,"name":"uid","type":"uint256"}],"name":"ResetAccount","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"mtfId","type":"uint256"},{"indexed":false,"name":"offerIdwantId","type":"uint256"},{"indexed":false,"name":"priceamount","type":"uint256"}],"name":"MtfEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"offerId","type":"uint256"},{"indexed":false,"name":"pirceamount","type":"uint256"}],"name":"OrderCreate","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"bankaddr","type":"address"},{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"currency","type":"bytes32"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"bankaddr","type":"address"},{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"currency","type":"bytes32"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Withdraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"addr","type":"address"},{"indexed":false,"name":"currency","type":"bytes32"},{"indexed":false,"name":"amount","type":"int256"},{"indexed":false,"name":"frozen","type":"int256"}],"name":"UpdateWallet","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"id","type":"uint256"},{"indexed":false,"name":"priceamount","type":"uint256"}],"name":"CancelOrderEvent","type":"event"}];
var coindbContract = web3.eth.contract(_jsonabi);
var address = "0xb10862b9f9d15a18c72ed31afdd4a069daaf9329";
var coindb = coindbContract.at(address);
var gasLimit = 1000000;
var gasPrice = 20000000000;
var coinUint  = 100000000;
var priceUint = 10000;
var txqueue = new TxQueues();
function TxQueues() {
    this.queues = {};
}
TxQueues.prototype.add = function (txitem) {
    if (!this.queues[txitem.priv]) {
        this.queues[txitem.priv] = new TransactionQueue(getAddress(txitem.priv), 0);
    }
    return this.queues[txitem.priv].add(txitem);
}
function getAddress(privkey)
{
    var privateKey1 = new Buffer(privkey, 'hex');
    var address = "0x" + ethUtil.privateToAddress(privateKey1).toString("hex");
    return address;
}
function TransactionQueue(address, max) {
    if (!max) {
        max = 256;
    }
    this.address = address;
    this.resetNonce()
        this.max = max;
    this.sendInterval = 1000;
    this.queue = [];
    this.pending = [];
    this.send();
    this.checktimeout();
}
TransactionQueue.prototype.resetNonce = function () {
    try {
        this.nonce = web3.eth.getTransactionCount(this.address, web3.eth.blockNumber);
    } catch(e) {
        console.log("resetNonce", e)
            return
    }
    console.log("last pending nonce = ", this.address, this.nonce);
}
TransactionQueue.prototype.add = function (txitem) {
    if (this.queue.length > this.max) {
        return false;
    }
    this.queue.push(txitem);
    return true;
}
TransactionQueue.prototype.send = function () {
    var _this = this
        console.log("send", this.queue.length)
        if (this.queue.length == 0) {
            setTimeout(function () {
                _this.send()
            }, this.sendInterval);
            return;
        }
    var txitem = this.queue[0];
    sendTransaction(txitem.priv, txitem.transaction, this.nonce, function (err, hash) {
        if (err != null && !err.message.startsWith("Known transaction")) {
            console.log("send err", err);
            _this.resetNonce();
        } else {
            var tx = _this.queue.shift();
            if (err == null) {
                tx.hash = hash;
            }
            tx.sendtime = nowtime();
            tx.nonce = _this.nonce;
            _this.pending.push(tx);
            console.log("send hash", _this.nonce, tx.hash, _this.queue.length);
            _this.nonce++;
        }
        _this.send()
    })
}
/*
 *     如果被区块链收录，那么调用callback
 *         如果没有被区块链收录，那么超时之后
 *          */
TransactionQueue.prototype.checktimeout = function () {
    var _this = this;
    console.log("checktimeout...", this.pending.length)
        if (this.pending.length == 0) {
            setTimeout(function () {
                _this.checktimeout();
            }, 1000)
            return;
        }
    try {
        var newnonce = web3.eth.getTransactionCount(this.address, web3.eth.blockNumber);
    } catch (err) {
        console.log("checktimeout error", err)
            setTimeout(function () {
                _this.checktimeout();
            }, 1000)
        return
    }
    var newpending = [];
    var timeouting = [];
    for (var i = 0; i < this.pending.length; i++) {
        if (this.pending[i].nonce < newnonce) {
            this.pending[i].callback(this.pending[i].hash, "0");
        } else {
            if (istimeout(this.pending[i].sendtime)) {
                timeouting.push(this.pending[i])
            } else {
                newpending.push(this.pending[i])
            }
        }
    }
    this.pending = newpending;
    var before = this.queue.length;
    if (timeouting.length > 0) {
        this.queue = timeouting.concat(this.queue);
        this.resetNonce();
    }
    console.log("pending", this.pending.length, "timeout", timeouting.length, "send", before, "->", this.queue.length)
        setTimeout(function () {
            _this.checktimeout();
        }, 100)
}
function istimeout(t) {
    return nowtime() - t > 10000;
}
function nowtime() {
    return new Date().getTime();
}
function cancelOrder(privatekey, orderid, callback)
{
    callback = callback || defaultCallBack;
    var tx = coindb.cancelOrder.createTransaction(orderid);
    if (!txqueue.add({transaction:tx, priv:privatekey, callback:callback})) {
        callback("请求队列已经满了", "-1")
    }
}
function placeOrder(privatekey, symbol, price, amount, isbuy, callback)
{
    callback = callback || defaultCallBack;
    var price = (parseFloat(price) / 10000)    *   10000;
    var amount = (parseFloat(amount) / 10000)  * 10000;
    if(price < 10000){
        callback("价格错误", "-1");
    } else if(amount < 10000){
        callback("数量错误", "-1");
    } else {
        var tx = coindb.placeOrder.createTransaction(symbol, price, amount, isbuy);
        if (!txqueue.add({transaction:tx, priv:privatekey, callback:callback})) {
            callback("请求队列已经满了", "-1")
        }
    }
}
function sendTransaction(privatekey, tx, nonce, callback)
{
    var myprivatekey = new Buffer(privatekey, 'hex');
    var address = "0x" + ethUtil.privateToAddress(myprivatekey).toString("hex");
    tx["nonce"] = nonce;
    tx["gasPrice"] = "0x" + gasPrice.toString(16);
    tx["gasLimit"] = "0x" + gasLimit.toString(16);
    var tx = new EthTx(tx);
    tx.sign(myprivatekey);
    var txstr = tx.serialize().toString("hex");
    web3.eth.sendRawTransaction(txstr, function(err, hash) {
        callback(err, hash);
    });
}
function defaultCallBack(err, hash)
{
    if(err){
        console.log('error:' + err);
    }else{
        console.log(hash);
    }
}
function placeOrderPromise(privatekey, symbol, price, amount, isbuy) {
    return new Promise(function (resolve, reject) {
        var callback = function (codestr, code) {
            if (code == "-1") {
                throw Error(codestr) 
        reject(codestr)
            } else {
                count++
        console.log("resolve", count)
        resolve(codestr) 
            }
        }
        placeOrder(privatekey, symbol, price, amount, isbuy, callback)
    });
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

    if(buyone == 0 && sellone == 0){
        alllist = getPlaceOrder(lastPrice,10);
    }else if(buyone == 0 && sellone >0){
        alllist = getPlaceOrder(lastPrice,1);
    }else if(buyone >0 && sellone ==0){
        alllist = getPlaceOrder(lastPrice,0);
    }else{
        alllist = getPlaceOrder(lastPrice,2);
    }   
    /*async.eachSeries(alllist,function(order,callback){
      if(order.type == 1){
      NewCoin.placeOrder(privateKey1,'OILCNY',order.price*100000000,randInt(0,3)*100000000,true);
      }else if(order.type == 0){
      NewCoin.placeOrder(privateKey1,'OILCNY',order.price*100000000,randInt(0,3)*100000000,false);
      }
      },function(err){
      console.log(err);
      setTimeout(run2,2000);
      })*/
    return alllist;
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

test();
var count = 0;
function test(){
    request.post({url:'http://122.224.124.250:9081/bulkstock/default/tickoil', form: {key:'value'}}, function(err,httpResponse,body){
            if(err){
                console.log(err);
                setTimeout(run,1000);
            }
            body = JSON.parse(body);
            var data = parseData(body);
            console.log(data);
            var p = [];
            count = 0;
            var priv = "465e78c3e07cce0f6f364030f7bc29a59adb31b1756d107724158248e571df46"
            for(var i = 0; i < data.length; i++){
                if(data[i].type == 1){
                    p.push(placeOrderPromise(priv, "OILCNY", data[i].price * coinUint, 1 * coinUint, true))
                }else{
                    p.push(placeOrderPromise(priv, "OILCNY", data[i].price * coinUint, 1 * coinUint, false))
                }
            }
            console.log("promise count", p.length)
            Promise.all(p).then(function (value) {
                console.log("all.value", value)
                test()
            }, function (err) {
                console.log("all.err", err)
            })
    })
}

function test1() {
    var data = getData();
    console.log('-----');
    console.log(data);
    var p = [];
    count = 0;
    var priv = "465e78c3e07cce0f6f364030f7bc29a59adb31b1756d107724158248e571df46";
    for(var i = 0; i < data.length; i++){
        if(data[i].type == 1){
            p.push(placeOrderPromise(priv, "OILCNY", data[i].price * coinUint, 1 * coinUint, true))
        }else{
            p.push(placeOrderPromise(priv, "OILCNY", data[i].price * coinUint, 1 * coinUint, false))
        }
    }
    console.log("promise count", p.length)
        Promise.all(p).then(function (value) {
            console.log("all.value", value)
            test()
        }, function (err) {
            console.log("all.err", err)
        })
}
