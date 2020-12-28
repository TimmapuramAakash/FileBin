CREATE SCHEMA IF NOT EXISTS `filebin`;

USE filebin;

CREATE TABLE IF NOT EXISTS `filebin`.`uploadinformation` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `uploaded_date` DATETIME NOT NULL,
  `downloaded_date` DATETIME NULL,
  `download_status` boolean NOT NULL,
  `link` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`));
