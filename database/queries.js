"use strict";
/**
 * All the functions to create mySQL query strings
 */

const defaultCharset = "utf8"; //The default character set for tables..
const {database,getRandom,state} = require("../lib/globals");
const mysql  = require("mysql");
const test = state.test;
let db_name;

//All globals to be escaped are processed in this function
exports.escapeGlobals = function(){
	db_name = mysql.escape(database.db_name);
	db_name = backTick(db_name);
};
//Normalise strings to mySQL syntax;
//- Replace "'" with backticks, ie. "`"
//- Replace '"' with "'"
function backTick(query){
	query = query.replace(/'/g,"`");
	query = query.replace(/"/g,"'");
	return query;
}
function escape(value){
	value = mysql.escape(value);
	value = value.replace(/'/g,"\"");
	return value;
}

exports.makeTables = function(){
	let q = "";
	for(let key of Object.keys(create)){
		q += create[key]();
	}
	return q;
};
const create = {
	dsus:function(){
		const table = test?"test_dsus":"dsus";
		const q = `
CREATE TABLE IF NOT EXISTS ${db_name}.'${table}' (
	'id' int(11) NOT NULL AUTO_INCREMENT,
	'description' varchar(255) NOT NULL,
	PRIMARY KEY ('id')
) ENGINE=InnoDB DEFAULT CHARSET=${defaultCharset};
		`;
		return backTick(q);
	},
	site_power:function(){
		const table = test?"test_site_power":"site_power";
		const q = `
CREATE TABLE IF NOT EXISTS ${db_name}.'${table}' (
	'id' int(11) NOT NULL AUTO_INCREMENT,
	'power' decimal(13,4) NOT NULL,
	'dsu_id' int(11) NOT NULL,
	'time_sent' datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	'nickname' varchar(255),
	PRIMARY KEY ('id'),
	FOREIGN KEY ('dsu_id')
		REFERENCES ${test?"'test_dsus'":"'dsus'"}('id')
) ENGINE=InnoDB DEFAULT CHARSET=${defaultCharset};
		`;
		return backTick(q);
	},
	dsu_power:function(){
		const table = test?"test_dsu_power":"dsu_power";
		const q = `
CREATE TABLE IF NOT EXISTS ${db_name}.'${table}' (
	'dsu_id' int(11) NOT NULL,
	'total_power' decimal(13,4) NOT NULL DEFAULT 0,
	'time_aggregated' datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY ('dsu_id'),
	FOREIGN KEY ('dsu_id')
		REFERENCES ${test?"'test_dsus'":"'dsus'"}('id')
		ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=${defaultCharset};
		`;
		return backTick(q);
	}
};
exports.make = {
	dsu:(description)=>{
		const table = test?"test_dsus":"dsus";
		const table2 = test?"test_dsu_power":"dsu_power";
		let q = `
INSERT INTO '${table}' ('description')
VALUES (${escape(description)});
SELECT @last := LAST_INSERT_ID();
INSERT INTO '${table2}' ('dsu_id')
VALUES (@last);
		`;
		return backTick(q);
	},
	site:(nickname,id)=>{
		const table = test?"test_site_power":"site_power";
		let q = `
INSERT INTO '${table}' ('nickname','dsu_id','power')
VALUES (${escape(nickname)},${id},${getRandom()});
		`;
		return backTick(q);
	}
};
exports.get = {
	all:()=>{
		const dsus = test?"test_dsus":"dsus";
		const site_power = test?"test_site_power":"site_power";
		const dsu_power = test?"test_dsu_power":"dsu_power";
		let q = `
SELECT '${dsus}'.'id' AS 'did', '${dsus}'.'description', '${site_power}'.'power', '${site_power}'.'time_sent', '${site_power}'.'nickname', '${site_power}'.'id' AS 'sid', '${dsu_power}'.'total_power', '${dsu_power}'.'time_aggregated'
FROM '${dsus}'
LEFT JOIN '${dsu_power}' ON '${dsu_power}'.'dsu_id' = '${dsus}'.'id'
LEFT JOIN '${site_power}' ON '${site_power}'.'dsu_id' = '${dsu_power}'.'dsu_id';
		`;
		return backTick(q);
	}
};
exports.set = {
	power:function(id){
		const table = test?"test_site_power":"site_power";
		let q = `
UPDATE '${table}'
SET 'power' = ${getRandom()}
WHERE 'id' = ${id};
		`;
		return backTick(q);
	},
	totalPower:function(id){
		const table = test?"test_dsu_power":"dsu_power";
		const table2 = test?"test_site_power":"site_power";
		let q = `
UPDATE '${table}'
SET 'total_power' = IFNULL((
	SELECT SUM('${table2}'.'power')
	FROM '${table2}'
	WHERE '${table2}'.'dsu_id'=${id}
),0)
WHERE '${table}'.'dsu_id'=${id};
		`;
		return backTick(q);
	},
	move:function(id,target){
		const table = test?"test_site_power":"site_power";
		let q = `
UPDATE '${table}'
SET 'dsu_id' = ${target}
WHERE 'id' = ${id};
		`;
		return backTick(q);
	}
};
exports.delete = {
	site:function(id){
		const table = test?"test_site_power":"site_power";
		let q = `
DELETE FROM '${table}' WHERE 'id' = ${id};
		`;
		return backTick(q);
	},
	dsu:function(id){
		const table = test?"test_dsus":"dsus";
		let q = `
DELETE FROM '${table}' WHERE 'id' = ${id};
		`;
		return backTick(q);
	}
};
exports.getTables = function(){
	let q = `
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = ${db_name.replace(/`/g,"'")};
	`;
	return q;
};
