CREATE TABLE `_dbName`.`dsus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `_dbName`.`site_power` (
  `id` int(11) NOT NULL,
  `power` decimal(13,4) NOT NULL,
  `dsu_id` int(11) NOT NULL,
  `time_sent` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (dsu_id) REFERENCES dsus(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `_dbName`.`dsu_power` (
  `dsu_id` int(11) NOT NULL,
  `total_power` decimal(13,4) NOT NULL DEFAULT 0,
  `time_aggregated` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`dsu_id`),
  FOREIGN KEY (dsu_id) REFERENCES dsus(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;