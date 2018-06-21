/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50540
Source Host           : localhost:3306
Source Database       : block_test

Target Server Type    : MYSQL
Target Server Version : 50540
File Encoding         : 65001

Date: 2016-08-25 14:25:07
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for accounts
-- ----------------------------
DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts` (
  `account` varchar(42) NOT NULL COMMENT '用户账户地址',
  `wei` bigint(15) DEFAULT '0' COMMENT 'wei 100000000',
  `type` tinyint(2) NOT NULL DEFAULT '0' COMMENT '0 unknown account 1 contract account 2 normal account',
  PRIMARY KEY (`account`),
  KEY `type` (`type`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for blocks
-- ----------------------------
DROP TABLE IF EXISTS `blocks`;
CREATE TABLE `blocks` (
  `block` bigint(13) NOT NULL,
  `miner` varchar(80) NOT NULL DEFAULT '0',
  `hash` varchar(150) NOT NULL DEFAULT '0',
  `difficulty` varchar(25) NOT NULL DEFAULT '0',
  `gas_limit` varchar(25) NOT NULL DEFAULT '0',
  `gas_used` varchar(25) NOT NULL DEFAULT '0',
  `parent_hash` varchar(150) NOT NULL DEFAULT '0',
  `nonce` varchar(50) NOT NULL DEFAULT '0',
  `transactions_root` varchar(150) NOT NULL DEFAULT '0',
  `tx_num` int(11) unsigned NOT NULL DEFAULT '0',
  `state_root` varchar(150) NOT NULL DEFAULT '0',
  `receipt_root` varchar(150) NOT NULL DEFAULT '0',
  `receipt_num` int(11) unsigned NOT NULL DEFAULT '0',
  `total_difficulty` varchar(25) NOT NULL DEFAULT '0',
  `size` bigint(20) DEFAULT '0',
  `extra_data` varchar(80) NOT NULL DEFAULT '0',
  `logs_bloom` text NOT NULL,
  `time` bigint(13) DEFAULT '0',
  `addtime` bigint(13) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`block`),
  KEY `hash` (`hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for contract_list
-- ----------------------------
DROP TABLE IF EXISTS `contract_list`;
CREATE TABLE `contract_list` (
  `contract` varchar(42) NOT NULL DEFAULT '' COMMENT '合约地址',
  `contract_type` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0 未知 1 大宗交易 2 33 3 票据',
  `contract_name` varchar(36) NOT NULL DEFAULT '' COMMENT '合约名字',
  `contract_title` varchar(36) NOT NULL DEFAULT '',
  `contract_status` tinyint(2) NOT NULL DEFAULT '0' COMMENT '0 使用中 1 旧合约',
  `contract_addtime` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`contract`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for goods_list
-- ----------------------------
DROP TABLE IF EXISTS `goods_list`;
CREATE TABLE `goods_list` (
  `goods_code` varchar(36) NOT NULL DEFAULT '' COMMENT '商品代码',
  `goods_name` varchar(24) NOT NULL DEFAULT '' COMMENT '商品名字',
  `goods_type` tinyint(4) NOT NULL DEFAULT '0' COMMENT '商品类型 ',
  PRIMARY KEY (`goods_code`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for new_blocks
-- ----------------------------
DROP TABLE IF EXISTS `new_blocks`;
CREATE TABLE `new_blocks` (
  `block` bigint(15) NOT NULL COMMENT '未同步的区块',
  `status` tinyint(2) DEFAULT '0' COMMENT '0 unlock 1 lock',
  PRIMARY KEY (`block`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for post_log
-- ----------------------------
DROP TABLE IF EXISTS `post_log`;
CREATE TABLE `post_log` (
  `content` varchar(512) DEFAULT NULL,
  `apiname` varchar(64) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for test
-- ----------------------------
DROP TABLE IF EXISTS `test`;
CREATE TABLE `test` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for trade_accounts
-- ----------------------------
DROP TABLE IF EXISTS `trade_accounts`;
CREATE TABLE `trade_accounts` (
  `addr` varchar(42) NOT NULL DEFAULT '',
  `currency` tinyint(4) NOT NULL DEFAULT '0' COMMENT '1  CNY 2 ETH 3 ETC 4 OIL',
  `active` bigint(20) NOT NULL DEFAULT '0',
  `frozen` bigint(20) NOT NULL,
  `addtime` bigint(20) NOT NULL DEFAULT '0',
  `update_time` bigint(20) NOT NULL DEFAULT '0',
  UNIQUE KEY `addr` (`addr`,`currency`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='资金表';

-- ----------------------------
-- Table structure for trade_cancelorders
-- ----------------------------
DROP TABLE IF EXISTS `trade_cancelorders`;
CREATE TABLE `trade_cancelorders` (
  `txhash` varchar(66) NOT NULL,
  `blocknumber` int(11) NOT NULL,
  `contract` varchar(42) NOT NULL,
  `account` varchar(42) NOT NULL,
  `offerid` int(11) NOT NULL,
  `price` varchar(30) NOT NULL,
  `amount` varchar(30) NOT NULL,
  `time` int(11) NOT NULL,
  `addtime` bigint(13) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for trade_market
-- ----------------------------
DROP TABLE IF EXISTS `trade_market`;
CREATE TABLE `trade_market` (
  `price` bigint(20) NOT NULL DEFAULT '0',
  `amount` bigint(20) NOT NULL,
  `currency` tinyint(4) NOT NULL COMMENT '货币类型 ETH ETC OIL ',
  `ty` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0 buy 1 sell',
  UNIQUE KEY `price` (`price`,`currency`,`ty`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='行情中心';

-- ----------------------------
-- Table structure for trade_matches
-- ----------------------------
DROP TABLE IF EXISTS `trade_matches`;
CREATE TABLE `trade_matches` (
  `id` bigint(20) NOT NULL,
  `type` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0 sell 1 buy',
  `symbol` tinyint(4) NOT NULL DEFAULT '0',
  `active_id` bigint(20) NOT NULL DEFAULT '0',
  `passive_id` bigint(20) NOT NULL DEFAULT '0',
  `price` bigint(20) NOT NULL DEFAULT '0',
  `cost_price` bigint(20) NOT NULL DEFAULT '0',
  `amount` bigint(20) NOT NULL DEFAULT '0',
  `matchtime` bigint(20) NOT NULL DEFAULT '0',
  `addtime` bigint(20) NOT NULL DEFAULT '0',
  `active_owner` varchar(42) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='成交明细表';

-- ----------------------------
-- Table structure for trade_matchorders
-- ----------------------------
DROP TABLE IF EXISTS `trade_matchorders`;
CREATE TABLE `trade_matchorders` (
  `txhash` varchar(66) NOT NULL,
  `blocknumber` int(11) NOT NULL,
  `contract` varchar(42) NOT NULL,
  `account` varchar(42) NOT NULL,
  `mtfid` int(11) NOT NULL,
  `offerid` int(11) NOT NULL,
  `wantid` int(11) NOT NULL,
  `price` varchar(30) NOT NULL,
  `amount` varchar(30) NOT NULL,
  `time` int(11) NOT NULL,
  `addtime` bigint(13) NOT NULL,
  PRIMARY KEY (`txhash`),
  KEY `txhash` (`txhash`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for trade_order
-- ----------------------------
DROP TABLE IF EXISTS `trade_order`;
CREATE TABLE `trade_order` (
  `id` int(11) NOT NULL DEFAULT '0',
  `owner` varchar(42) DEFAULT NULL,
  `type` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0 sell 1 buy',
  `symbol` tinyint(4) NOT NULL DEFAULT '0' COMMENT '货币类型',
  `price` bigint(20) NOT NULL DEFAULT '0',
  `amount` bigint(20) NOT NULL DEFAULT '0',
  `unmatch` bigint(20) NOT NULL DEFAULT '0',
  `cancelamount` bigint(20) NOT NULL DEFAULT '0',
  `cost` bigint(30) NOT NULL DEFAULT '0',
  `addtime` bigint(20) NOT NULL DEFAULT '0',
  `update_time` bigint(20) NOT NULL DEFAULT '0',
  `insert_time` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='订单表';

-- ----------------------------
-- Table structure for trade_placeorders
-- ----------------------------
DROP TABLE IF EXISTS `trade_placeorders`;
CREATE TABLE `trade_placeorders` (
  `txhash` varchar(66) NOT NULL,
  `blocknumber` int(11) NOT NULL,
  `contract` varchar(42) NOT NULL,
  `offerid` int(11) NOT NULL,
  `account` varchar(42) NOT NULL,
  `price` varchar(30) NOT NULL,
  `amount` varchar(30) NOT NULL,
  `symbol` varchar(30) NOT NULL,
  `isbuy` tinyint(4) NOT NULL,
  `time` int(11) NOT NULL,
  `addtime` bigint(13) NOT NULL,
  PRIMARY KEY (`txhash`),
  KEY `txhash` (`txhash`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for trade_sendcoins
-- ----------------------------
DROP TABLE IF EXISTS `trade_sendcoins`;
CREATE TABLE `trade_sendcoins` (
  `txhash` varchar(66) NOT NULL,
  `blocknumber` int(11) unsigned NOT NULL,
  `contract` varchar(42) NOT NULL,
  `currency` varchar(30) NOT NULL,
  `amount` varchar(30) NOT NULL,
  `addr` varchar(42) NOT NULL,
  `bankaddr` varchar(42) NOT NULL,
  `type` tinyint(4) unsigned NOT NULL,
  `time` int(11) unsigned NOT NULL,
  `addtime` bigint(13) unsigned NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for trade_update_log
-- ----------------------------
DROP TABLE IF EXISTS `trade_update_log`;
CREATE TABLE `trade_update_log` (
  `blocknumber` int(11) NOT NULL,
  `addtime` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`blocknumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for transactions
-- ----------------------------
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `hash` varchar(150) NOT NULL,
  `nonce` int(11) NOT NULL,
  `blockhash` varchar(150) NOT NULL,
  `blocknumber` bigint(13) NOT NULL,
  `tindex` int(11) DEFAULT '0',
  `tfrom` varchar(42) NOT NULL,
  `towhere` varchar(42) NOT NULL,
  `value` varchar(50) NOT NULL,
  `gas` bigint(20) NOT NULL,
  `gasprice` varchar(50) NOT NULL,
  `input` text NOT NULL,
  `time` bigint(13) NOT NULL DEFAULT '0',
  `func` varchar(255) DEFAULT NULL,
  `args` text NOT NULL,
  `cumulative_gas_used` varchar(25) NOT NULL,
  `gas_used` varchar(25) NOT NULL,
  `logs` text NOT NULL,
  `receiptlogs` text NOT NULL,
  `input_source` text NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0 未处理  1 已处理',
  `addtime` bigint(13) unsigned NOT NULL,
  PRIMARY KEY (`hash`),
  KEY `blocknumber` (`blocknumber`),
  KEY `hash` (`hash`),
  KEY `towhere` (`towhere`) USING BTREE,
  KEY `blockhash` (`blockhash`) USING BTREE,
  KEY `tfrom` (`tfrom`) USING BTREE,
  KEY `status` (`status`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- ----------------------------
-- Procedure structure for updateAccount
-- ----------------------------
DROP PROCEDURE IF EXISTS `updateAccount`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `updateAccount`(IN `in_account` varchar(42))
BEGIN
	DECLARE var_account VARCHAR(42) CHARACTER set utf8 ;
	DECLARE err int DEFAULT -1 ;
	SELECT account from accounts where account = in_account into var_account;
	
	IF var_account is NULL
		then 
		insert into accounts set account = in_account;
		set err = 1;
	ELSE
		set err = 0;
	end if;
select err;
END
;;
DELIMITER ;
