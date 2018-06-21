-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: 2016-08-15 07:42:03
-- 服务器版本： 5.6.17
-- PHP Version: 5.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `newblock`
--

DELIMITER $$
--
-- 存储过程
--
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
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- 表的结构 `33_cancelorders`
--

CREATE TABLE IF NOT EXISTS `33_cancelorders` (
  `txhash` varchar(66) NOT NULL DEFAULT '',
  `blocknumber` int(11) DEFAULT NULL,
  `contract` varchar(42) DEFAULT NULL,
  `offerid` int(11) DEFAULT NULL,
  `account` varchar(42) DEFAULT NULL,
  `time` int(11) NOT NULL DEFAULT '0',
  `addtime` bigint(13) DEFAULT NULL,
  PRIMARY KEY (`txhash`),
  KEY `txhash` (`txhash`),
  KEY `offerid` (`offerid`),
  KEY `blocknumber` (`blocknumber`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `33_matchorders`
--

CREATE TABLE IF NOT EXISTS `33_matchorders` (
  `txhash` varchar(66) NOT NULL DEFAULT '',
  `blocknumber` int(11) DEFAULT NULL,
  `contract` varchar(42) DEFAULT NULL,
  `offerid1er` varchar(42) DEFAULT NULL,
  `offerid2er` varchar(42) DEFAULT NULL,
  `actionid` int(11) DEFAULT NULL,
  `offerid1` int(11) DEFAULT NULL,
  `offerid2` int(11) DEFAULT NULL,
  `amount` varchar(30) DEFAULT NULL,
  `price` varchar(30) DEFAULT NULL,
  `time` int(11) NOT NULL DEFAULT '0',
  `addtime` bigint(13) NOT NULL,
  PRIMARY KEY (`txhash`),
  KEY `txhash` (`txhash`),
  KEY `offerid1` (`offerid1`),
  KEY `offerid2` (`offerid2`),
  KEY `blocknumber` (`blocknumber`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `33_placeorders`
--

CREATE TABLE IF NOT EXISTS `33_placeorders` (
  `txhash` varchar(66) NOT NULL DEFAULT '',
  `blocknumber` int(11) DEFAULT NULL,
  `contract` varchar(42) DEFAULT NULL,
  `offerid` int(11) DEFAULT NULL,
  `account` varchar(42) DEFAULT NULL,
  `offer_currency` varchar(30) DEFAULT NULL,
  `offer_value` varchar(30) DEFAULT NULL,
  `want_currency` varchar(30) DEFAULT NULL,
  `want_value` varchar(30) DEFAULT NULL,
  `time` int(11) NOT NULL DEFAULT '0',
  `addtime` bigint(13) NOT NULL,
  PRIMARY KEY (`txhash`),
  KEY `txhash` (`txhash`),
  KEY `offerid` (`offerid`),
  KEY `blocknumber` (`blocknumber`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `33_sendcoins`
--

CREATE TABLE IF NOT EXISTS `33_sendcoins` (
  `txhash` varchar(66) NOT NULL DEFAULT '',
  `blocknumber` int(11) DEFAULT NULL,
  `contract` varchar(42) DEFAULT NULL,
  `type` varchar(30) DEFAULT NULL,
  `tfrom` varchar(42) DEFAULT NULL,
  `towhere` varchar(42) DEFAULT NULL,
  `name` varchar(30) DEFAULT NULL,
  `amount` varchar(30) DEFAULT NULL,
  `time` int(11) NOT NULL DEFAULT '0',
  `addtime` bigint(13) DEFAULT NULL,
  PRIMARY KEY (`txhash`),
  KEY `txhash` (`txhash`),
  KEY `blocknumber` (`blocknumber`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `accounts`
--

CREATE TABLE IF NOT EXISTS `accounts` (
  `account` varchar(42) NOT NULL COMMENT '用户账户地址',
  `wei` bigint(15) DEFAULT '0' COMMENT 'wei 100000000',
  `type` tinyint(2) NOT NULL DEFAULT '0' COMMENT '0 unknown account 1 contract account 2 normal account',
  PRIMARY KEY (`account`),
  KEY `type` (`type`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `blocks`
--

CREATE TABLE IF NOT EXISTS `blocks` (
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `bp_cancelorders`
--

CREATE TABLE IF NOT EXISTS `bp_cancelorders` (
  `txhash` varchar(66) NOT NULL DEFAULT '',
  `blocknumber` int(11) DEFAULT NULL,
  `contract` varchar(42) DEFAULT NULL,
  `offerid` int(11) DEFAULT NULL,
  `account` varchar(42) DEFAULT NULL,
  `time` int(11) NOT NULL DEFAULT '0',
  `addtime` bigint(13) DEFAULT NULL,
  PRIMARY KEY (`txhash`),
  KEY `txhash` (`txhash`),
  KEY `offerid` (`offerid`),
  KEY `blocknumber` (`blocknumber`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `bp_matchorders`
--

CREATE TABLE IF NOT EXISTS `bp_matchorders` (
  `txhash` varchar(66) NOT NULL DEFAULT '',
  `blocknumber` int(11) DEFAULT NULL,
  `contract` varchar(42) DEFAULT NULL,
  `offerid1er` varchar(42) DEFAULT NULL,
  `offerid2er` varchar(42) DEFAULT NULL,
  `actionid` int(11) DEFAULT NULL,
  `offerid1` int(11) DEFAULT NULL,
  `offerid2` int(11) DEFAULT NULL,
  `amount` varchar(30) DEFAULT NULL,
  `price` varchar(30) DEFAULT NULL,
  `time` int(11) NOT NULL DEFAULT '0',
  `addtime` bigint(13) NOT NULL,
  PRIMARY KEY (`txhash`),
  KEY `txhash` (`txhash`),
  KEY `offerid1` (`offerid1`),
  KEY `offerid2` (`offerid2`),
  KEY `blocknumber` (`blocknumber`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `bp_placeorders`
--

CREATE TABLE IF NOT EXISTS `bp_placeorders` (
  `txhash` varchar(66) NOT NULL DEFAULT '',
  `blocknumber` int(11) DEFAULT NULL,
  `contract` varchar(42) DEFAULT NULL,
  `offerid` int(11) DEFAULT NULL,
  `account` varchar(42) DEFAULT NULL,
  `offer_currency` varchar(30) DEFAULT NULL,
  `offer_value` varchar(30) DEFAULT NULL,
  `want_currency` varchar(30) DEFAULT NULL,
  `want_value` varchar(30) DEFAULT NULL,
  `time` int(11) NOT NULL DEFAULT '0',
  `addtime` bigint(13) NOT NULL,
  PRIMARY KEY (`txhash`),
  KEY `txhash` (`txhash`),
  KEY `offerid` (`offerid`),
  KEY `blocknumber` (`blocknumber`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `bp_sendcoins`
--

CREATE TABLE IF NOT EXISTS `bp_sendcoins` (
  `txhash` varchar(66) NOT NULL DEFAULT '',
  `blocknumber` int(11) DEFAULT NULL,
  `contract` varchar(42) DEFAULT NULL,
  `type` varchar(30) DEFAULT NULL,
  `tfrom` varchar(42) DEFAULT NULL,
  `towhere` varchar(42) DEFAULT NULL,
  `name` varchar(30) DEFAULT NULL,
  `amount` varchar(30) DEFAULT NULL,
  `time` int(11) NOT NULL DEFAULT '0',
  `addtime` bigint(13) DEFAULT NULL,
  PRIMARY KEY (`txhash`),
  KEY `txhash` (`txhash`),
  KEY `blocknumber` (`blocknumber`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `contract_list`
--

CREATE TABLE IF NOT EXISTS `contract_list` (
  `contract` varchar(42) NOT NULL DEFAULT '' COMMENT '合约地址',
  `contract_type` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0 未知 1 大宗交易 2 33 3 票据',
  `contract_name` varchar(36) NOT NULL DEFAULT '' COMMENT '合约名字',
  `contract_title` varchar(36) NOT NULL DEFAULT '',
  `contract_status` tinyint(2) NOT NULL DEFAULT '0' COMMENT '0 使用中 1 旧合约',
  `contract_addtime` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`contract`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `goods_list`
--

CREATE TABLE IF NOT EXISTS `goods_list` (
  `goods_code` varchar(36) NOT NULL DEFAULT '' COMMENT '商品代码',
  `goods_name` varchar(24) NOT NULL DEFAULT '' COMMENT '商品名字',
  `goods_type` tinyint(4) NOT NULL DEFAULT '0' COMMENT '商品类型 ',
  PRIMARY KEY (`goods_code`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `new_blocks`
--

CREATE TABLE IF NOT EXISTS `new_blocks` (
  `block` bigint(15) NOT NULL COMMENT '未同步的区块',
  `status` tinyint(2) DEFAULT '0' COMMENT '0 unlock 1 lock',
  PRIMARY KEY (`block`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `receive_mail_list`
--

CREATE TABLE IF NOT EXISTS `receive_mail_list` (
  `mail_id` int(11) NOT NULL COMMENT '邮件ID',
  `mail_date` datetime DEFAULT NULL,
  `mail_subject` varchar(256) NOT NULL DEFAULT '' COMMENT '邮件标题',
  `mail_from_name` varchar(64) NOT NULL DEFAULT '',
  `mail_from_address` varchar(128) NOT NULL DEFAULT '' COMMENT '邮件发送者',
  `mail_to` varchar(128) NOT NULL DEFAULT '' COMMENT '邮件接收者地址',
  `mail_reply_to` text,
  `mail_cc` text,
  `mail_message_id` varchar(128) NOT NULL DEFAULT '' COMMENT '邮件消息ID',
  `mail_text_plain` varchar(128) NOT NULL DEFAULT '',
  `mail_text_html` text,
  `mail_attchments` varchar(256) NOT NULL DEFAULT '',
  `mail_content_account` varchar(12) NOT NULL DEFAULT '0' COMMENT '账户',
  `mail_content_date` varchar(36) NOT NULL DEFAULT '' COMMENT '日期',
  `mail_content_amount` float(11,2) NOT NULL DEFAULT '0.00' COMMENT '资金',
  `mail_content_balance` float(11,2) NOT NULL DEFAULT '0.00' COMMENT '资金余额',
  `mail_content_ext` varchar(256) NOT NULL DEFAULT '' COMMENT '备注',
  `mail_content_card` varchar(6) NOT NULL DEFAULT '' COMMENT '付方账号尾号',
  `mail_content_payer` varchar(32) NOT NULL DEFAULT '' COMMENT '付方 或者 收款人 ',
  `mail_content_fee` float(11,2) NOT NULL DEFAULT '0.00' COMMENT '手续费',
  `mail_content_type` tinyint(11) NOT NULL DEFAULT '0' COMMENT '0：自己入账，1：进账，2：出账',
  `addtime` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`mail_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `test`
--

CREATE TABLE IF NOT EXISTS `test` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `trade_accounts`
--

CREATE TABLE IF NOT EXISTS `trade_accounts` (
  `addr` varchar(42) NOT NULL DEFAULT '',
  `currency` tinyint(4) NOT NULL DEFAULT '0' COMMENT '1 其它货币类型',
  `active` bigint(20) NOT NULL DEFAULT '0',
  `frozen` bigint(20) NOT NULL,
  `addtime` bigint(20) NOT NULL DEFAULT '0',
  `update_time` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`addr`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='资金表';

-- --------------------------------------------------------

--
-- 表的结构 `trade_cancelorders`
--

CREATE TABLE IF NOT EXISTS `trade_cancelorders` (
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

-- --------------------------------------------------------

--
-- 表的结构 `trade_market`
--

CREATE TABLE IF NOT EXISTS `trade_market` (
  `price` bigint(20) NOT NULL DEFAULT '0',
  `amount` bigint(20) NOT NULL,
  `currency` tinyint(4) NOT NULL COMMENT '货币类型 ETH ETC OIL ',
  PRIMARY KEY (`price`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='行情中心';

-- --------------------------------------------------------

--
-- 表的结构 `trade_matches`
--

CREATE TABLE IF NOT EXISTS `trade_matches` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `active_id` bigint(20) NOT NULL DEFAULT '0',
  `passive_id` bigint(20) NOT NULL DEFAULT '0',
  `price` bigint(20) NOT NULL DEFAULT '0',
  `amount` bigint(20) NOT NULL DEFAULT '0',
  `matchtime` bigint(20) NOT NULL DEFAULT '0',
  `addtime` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='成交明细表' AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- 表的结构 `trade_matchorders`
--

CREATE TABLE IF NOT EXISTS `trade_matchorders` (
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

-- --------------------------------------------------------

--
-- 表的结构 `trade_order`
--

CREATE TABLE IF NOT EXISTS `trade_order` (
  `id` int(11) NOT NULL DEFAULT '0',
  `type` tinyint(4) NOT NULL DEFAULT '0' COMMENT '1 buy 2 sell',
  `symbol` tinyint(4) NOT NULL DEFAULT '0' COMMENT '货币类型',
  `price` bigint(20) NOT NULL DEFAULT '0',
  `amount` bigint(20) NOT NULL DEFAULT '0',
  `unmatch` bigint(20) NOT NULL DEFAULT '0',
  `cancelamount` bigint(20) NOT NULL DEFAULT '0',
  `addtime` bigint(20) NOT NULL DEFAULT '0',
  `update_time` bigint(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COMMENT='订单表';

-- --------------------------------------------------------

--
-- 表的结构 `trade_placeorders`
--

CREATE TABLE IF NOT EXISTS `trade_placeorders` (
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

-- --------------------------------------------------------

--
-- 表的结构 `trade_sendcoins`
--

CREATE TABLE IF NOT EXISTS `trade_sendcoins` (
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

-- --------------------------------------------------------

--
-- 表的结构 `transactions`
--

CREATE TABLE IF NOT EXISTS `transactions` (
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
  `addtime` bigint(13) unsigned NOT NULL,
  PRIMARY KEY (`hash`),
  KEY `blocknumber` (`blocknumber`),
  KEY `hash` (`hash`),
  KEY `towhere` (`towhere`) USING BTREE,
  KEY `blockhash` (`blockhash`) USING BTREE,
  KEY `tfrom` (`tfrom`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
