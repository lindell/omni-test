CREATE DATABASE IF NOT EXISTS `omnitest`;
USE `omnitest`;

DROP TABLE IF EXISTS `configs`;
CREATE TABLE `configs` (
  `client_name` varchar(100),
  `version` varchar(100),
  `key_name` varchar(100),
  `value` varchar(100),
  `config_id` int,
  INDEX (`client_name`, `version`)
);

CREATE USER omnitest_user IDENTIFIED BY 'topsecret';
GRANT ALL PRIVILEGES ON omnitest.* TO omnitest_user;
