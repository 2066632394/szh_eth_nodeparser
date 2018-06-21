var dbConfig = {
    pooldb : {
        host : "127.0.0.1",
        user : "root",
        password : "fuzamei@bty",
        database : "block_test1",
        connectionLimit : 100,
        port:3306,
        queueLimit:0,
        connectTimeout: 1000000,
        acquireTimeout: 1000000,
        multipleStatements : false,
        debug: false
    },
    pooldb1 : {
        host : "127.0.0.1",
        user : "root_insert",
        password : "Fuzamei7799",
        database : "block_test",
        connectionLimit : 100,
        port:3306,
        queueLimit:0,
        connectTimeout: 1000000,
        acquireTimeout: 1000000,
        multipleStatements : false,
        debug: false
    },
    pooldb2 : {
        host : "118.178.16.8",
        user : "root_insert",
        password : "Fuzamei7799",
        database : "block_redis",
        connectionLimit : 100,
        port:3306,
        queueLimit:0,
        connectTimeout: 1000000,
        acquireTimeout: 1000000,
        multipleStatements : false,
        debug: false
    },
    pooldb3 : {
        host : "127.0.0.1",
        user : "root",
        password : "fuzamei@bty",
        database : "block_test2",
        connectionLimit : 50,
        port:3306,
        queueLimit:0,
        connectTimeout: 1000000,
        acquireTimeout: 1000000,
        multipleStatements : false,
        debug: false
    },
    pooldb_eth : {
        host : "127.0.0.1",
        user : "root",
        password : "fuzamei@bty",
        database : "block_eth",
        connectionLimit : 50,
        port:3306,
        queueLimit:0,
        connectTimeout: 1000000,
        acquireTimeout: 1000000,
        multipleStatements : false,
        debug: false
    },
    pooldb_bill : {
        host : "127.0.0.1",
        user : "root",
        password : "fuzamei@bty",
        database : "block_bill",
        connectionLimit : 50,
        port:3306,
        queueLimit:0,
        connectTimeout: 1000000,
        acquireTimeout: 1000000,
        multipleStatements : false,
        debug: false
    },
    pooldb_btc : {
        host : "127.0.0.1",
        user : "root",
        password : "root",
        database : "block_btc",
        connectionLimit : 100,
        port:3306,
        queueLimit:0,
        connectTimeout: 1000000,
        acquireTimeout: 1000000,
        multipleStatements : false,
        debug: false
    },


};

module.exports = dbConfig;

