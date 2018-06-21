-- MySQL dump 10.13  Distrib 5.5.52, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: block_bill
-- ------------------------------------------------------
-- Server version	5.5.52-0ubuntu0.14.04.1-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accounts` (
  `account` varchar(42) NOT NULL COMMENT '用户账户地址',
  `wei` bigint(15) DEFAULT '0' COMMENT 'wei 100000000',
  `type` tinyint(2) NOT NULL DEFAULT '0' COMMENT '0 unknown account 1 contract account 2 normal account',
  PRIMARY KEY (`account`),
  KEY `type` (`type`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bill_accounts`
--

DROP TABLE IF EXISTS `bill_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bill_accounts` (
  `addr` varchar(42) NOT NULL DEFAULT '',
  `currency` tinyint(4) NOT NULL DEFAULT '0' COMMENT '1  CNY 2 ETH 3 ETC 4 OIL',
  `active` bigint(20) NOT NULL DEFAULT '0',
  `frozen` bigint(20) NOT NULL DEFAULT '0',
  `addtime` bigint(20) NOT NULL DEFAULT '0',
  `update_time` bigint(20) NOT NULL DEFAULT '0',
  `type` tinyint(3) NOT NULL DEFAULT '0' COMMENT '0 融资者 1 投资者',
  UNIQUE KEY `addr` (`addr`,`currency`,`type`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='资金表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bill_config`
--

DROP TABLE IF EXISTS `bill_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bill_config` (
  `name` varchar(42) NOT NULL,
  `value` varchar(64) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bill_invest_list`
--

DROP TABLE IF EXISTS `bill_invest_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bill_invest_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `address` varchar(42) NOT NULL COMMENT '投资者地址',
  `bill_id` int(11) NOT NULL COMMENT '票据ID',
  `num` int(11) NOT NULL,
  `addtime` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bill_invest_log`
--

DROP TABLE IF EXISTS `bill_invest_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bill_invest_log` (
  `txhash` varchar(66) NOT NULL,
  `address` varchar(42) NOT NULL,
  `bill_id` int(11) NOT NULL,
  `num` int(11) NOT NULL,
  `addtime` int(11) NOT NULL,
  PRIMARY KEY (`txhash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bill_list`
--

DROP TABLE IF EXISTS `bill_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bill_list` (
  `bill_id` int(11) NOT NULL COMMENT '票据ID',
  `address` varchar(42) NOT NULL COMMENT '用户地址',
  `bill` bigint(20) NOT NULL COMMENT '票据面值',
  `origin_bill` bigint(20) NOT NULL,
  `rmb` bigint(20) NOT NULL COMMENT '票据融资额',
  `origin_rmb` bigint(20) NOT NULL,
  `unit` int(11) NOT NULL COMMENT '向投资者出售时每份的价格',
  `unsellcount` int(11) NOT NULL COMMENT '票据未出售的份数',
  `totalcount` int(11) NOT NULL COMMENT '票据总共份数',
  `starttime` int(11) NOT NULL,
  `endtime` int(11) NOT NULL,
  `addtime` int(11) NOT NULL,
  `updatetime` int(11) NOT NULL,
  `status` tinyint(3) NOT NULL DEFAULT '0' COMMENT '0 进行中 1 关闭',
  PRIMARY KEY (`bill_id`),
  UNIQUE KEY `bill_id` (`bill_id`,`address`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bill_new_log`
--

DROP TABLE IF EXISTS `bill_new_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bill_new_log` (
  `txhash` varchar(66) NOT NULL,
  `bill_id` int(11) NOT NULL,
  `address` varchar(42) NOT NULL,
  `bill` bigint(20) NOT NULL,
  `rmb` bigint(20) NOT NULL,
  `unit` bigint(20) NOT NULL,
  `starttime` int(11) NOT NULL,
  `endtime` int(11) NOT NULL,
  PRIMARY KEY (`txhash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bill_rmb_log`
--

DROP TABLE IF EXISTS `bill_rmb_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bill_rmb_log` (
  `txhash` varchar(66) NOT NULL,
  `address` varchar(42) NOT NULL,
  `rmb` bigint(20) NOT NULL COMMENT '金额',
  `trade_type` tinyint(3) NOT NULL DEFAULT '0' COMMENT '0 deposit 1 withdraw',
  `type` tinyint(3) NOT NULL DEFAULT '0' COMMENT '0 融资者 1 投资者 ',
  `addtime` int(11) NOT NULL,
  PRIMARY KEY (`txhash`),
  KEY `address` (`address`) USING BTREE
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `blocks`
--

DROP TABLE IF EXISTS `blocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `post_log`
--

DROP TABLE IF EXISTS `post_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `post_log` (
  `content` varchar(512) DEFAULT NULL,
  `apiname` varchar(64) DEFAULT NULL,
  `addtime` int(11) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `trade_update_log`
--

DROP TABLE IF EXISTS `trade_update_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trade_update_log` (
  `blocknumber` int(11) NOT NULL,
  `addtime` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`blocknumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `uid` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  PRIMARY KEY (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-11-01 10:58:59
