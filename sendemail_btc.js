var Email = require('email').Email
var myMsg = new Email(
        {   
            from: "szh@disanbo.com",
            to:   "2066632394@qq.com",
            subject: "btc err", 
            body: "test"
        })

// if callback is provided, errors will be passed into it
// // else errors will be thrown
myMsg.send(function(err){
    console.log(err);

})
