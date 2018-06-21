var contractConfig = {

    "0x3dd22c151fb9a98eeeacede3e067c0a1fa71ad2a" : {
        name : "evi",
        address : "0x3dd22c151fb9a98eeeacede3e067c0a1fa71ad2a",
        abiJson : [{"constant":false,"inputs":[{"name":"hash","type":"bytes32"}],"name":"getowner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"hash","type":"bytes32"}],"name":"savehash","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"}],"name":"gethash","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"hash","type":"bytes32"}],"name":"SaveHash","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"code","type":"bytes32"}],"name":"Error","type":"event"}], 
        script : "",
        table : ["evi_list"]
    },
    "0x9f74056d069a8f18eb6d82e01647392517f520b1" : {
        name : "evi",
        address : "0x9f74056d069a8f18eb6d82e01647392517f520b1",        
        abiJson : [{"constant":false,"inputs":[{"name":"hash","type":"bytes32"}],"name":"getowner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"},{"name":"hash","type":"bytes32"}],"name":"savehash","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"name","type":"bytes32"}],"name":"gethash","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"name","type":"bytes32"},{"indexed":false,"name":"hash","type":"bytes32"}],"name":"SaveHash","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":false,"name":"code","type":"bytes32"}],"name":"Error","type":"event"}],         
        script : "",        
        table : ["evi_list"]    
    }, 

};
module.exports = contractConfig;
