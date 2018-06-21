-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: 2016-07-01 09:48:32
-- 服务器版本： 5.6.17
-- PHP Version: 5.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `wzwchain`
--

-- --------------------------------------------------------

--
-- 表的结构 `blocks`
--

CREATE TABLE IF NOT EXISTS `blocks` (
  `block` bigint(13) NOT NULL,
  `miner` varchar(80) NOT NULL,
  `hash` varchar(150) NOT NULL,
  `difficulty` varchar(25) NOT NULL,
  `gas_limit` varchar(25) NOT NULL DEFAULT '0',
  `gas_used` varchar(25) NOT NULL DEFAULT '0',
  `parent_hash` varchar(150) NOT NULL,
  `nonce` varchar(50) NOT NULL,
  `transactions_root` varchar(150) NOT NULL,
  `tx_num` int(11) unsigned NOT NULL,
  `state_root` varchar(150) NOT NULL,
  `receipt_root` varchar(150) NOT NULL,
  `receipt_num` int(11) unsigned NOT NULL,
  `total_difficulty` varchar(25) NOT NULL,
  `size` bigint(20) DEFAULT '0',
  `extra_data` varchar(80) NOT NULL,
  `logs_bloom` text NOT NULL,
  `time` bigint(13) DEFAULT '0',
  `addtime` bigint(13) unsigned NOT NULL,
  PRIMARY KEY (`block`),
  KEY `hash` (`hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
  `time` varchar(10) DEFAULT NULL,
  `addtime` bigint(13) DEFAULT NULL,
  PRIMARY KEY (`txhash`),
  KEY `txhash` (`txhash`),
  KEY `offerid` (`offerid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
  `time` varchar(10) DEFAULT NULL,
  `addtime` bigint(13) NOT NULL,
  PRIMARY KEY (`txhash`),
  KEY `txhash` (`txhash`),
  KEY `offerid1` (`offerid1`),
  KEY `offerid2` (`offerid2`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
  `time` varchar(10) DEFAULT NULL,
  `addtime` bigint(13) NOT NULL,
  PRIMARY KEY (`txhash`),
  KEY `txhash` (`txhash`),
  KEY `offerid` (`offerid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
  `time` varchar(10) DEFAULT NULL,
  `addtime` bigint(13) DEFAULT NULL,
  PRIMARY KEY (`txhash`),
  KEY `txhash` (`txhash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 表的结构 `test`
--

CREATE TABLE IF NOT EXISTS `test` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

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
  `time` bigint(13) DEFAULT NULL,
  `func` varchar(255) DEFAULT NULL,
  `args` text NOT NULL,
  `cumulative_gas_used` varchar(25) NOT NULL,
  `gas_used` varchar(25) NOT NULL,
  `logs` text NOT NULL,
  `addtime` bigint(13) unsigned NOT NULL,
  PRIMARY KEY (`hash`),
  KEY `blocknumber` (`blocknumber`),
  KEY `hash` (`hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
