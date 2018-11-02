"use strict"

const {database} = require("../lib/globals");


const create = {
	dsus:function(test){
		let table = "dsus";
		if(test) table =  "test_dsus";
		return `
CREATE TABLE IF NOT EXISTS '${database.db_name}'.'${table}' (
	'id' int(11) NOT NULL AUTO_INCREMENT,
	'description' varchar(255) NOT NULL,
	PRIMARY KEY ('id')
	) ENGINE=InnoDB DEFAULT CHARSET=utf8;
		`

	},
	site_power:function(test){
		let table = "site_power";
		if(test) table =  "test_site_power";
		return `
CREATE TABLE IF NOT EXISTS '${database.db_name}'.'${table}' (
	'id' int(11) NOT NULL,
	'power' decimal(13,4) NOT NULL,
	'dsu_id' int(11) NOT NULL,
	'time_sent' datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY ('id'),
	FOREIGN KEY (dsu_id) REFERENCES ${test?"test_dsus":"dsus"}(id)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8;
		`
	},
	dsu_power:function(test){
		let table = "dsu_power";
		if(test) table =  "test_dsu_power";
		return `
CREATE TABLE IF NOT EXISTS '${database.db_name}'.'${table}' (
	'dsu_id' int(11) NOT NULL,
	'total_power' decimal(13,4) NOT NULL DEFAULT 0,
	'time_aggregated' datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY ('dsu_id'),
	FOREIGN KEY (dsu_id) REFERENCES ${test?"test_dsus":"dsus"}(id)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8;
		`
	}
}
exports.makeTables = function(test){
	//let query = create.dsus();
	
	let query = ``;
	for(let key of Object.keys(create)){
		query += create[key](test);
	}
	
	return query;
}
exports.getTables = function(){
	return `
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA='${database.db_name}';
	`
}