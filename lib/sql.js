"use strict";

const mysql  = require('mysql');
const {database,Log} = require("./globals");
const query = require("../database/queries");

let connection;

exports.makeConnection = function(callback,settings){
	if(!settings) settings = database;
	connection = mysql.createConnection({
		host:settings.db_host,
		port:settings.db_port,
		user:settings.user,
		password:settings.password,
		database:settings.db_name,
		multipleStatements: true
	});
	connection.connect((err)=>{
		callback(err)
	});
}
exports.checkDatabase = function(callback){
	let q = query.getTables();
	connection.query(q,(err,results)=>{
		if (err){
			close(err);
			return;
		};
		results = results.map((result)=>{
			return result.TABLE_NAME;
		})
		let requiredTables = ["dsus","site_power","dsu_power"];
		let testTables = [];
		for(let key of requiredTables){
			testTables.push("test_"+key);
		}
		requiredTables = requiredTables.concat(testTables);
		const tableMissing = requiredTables.some((table)=>{
			return results.indexOf(table) === -1;
		})
		if(tableMissing){
			q = query.makeTables();
			q += query.makeTables(true);
			q = q.replace(/'/g,"`").toString();
			connection.query(q,(err,results)=>{
				if (err){
					close(err);
					callback(true);
					return;
				};
				if(results.length === requiredTables.length){
					const message = "All databases created successfully"
					Log.info(message);
					console.info(message);
					close();
					callback();
				}else{
					close("Could not create all required databases");
					callback(true);
				}
			})
		}else{
			const message = "All databases already exist"
			Log.info(message);
			console.info(message);
			close();
			callback();
		};
	});
}

function close(err){
	if(err)Log.error(err);
	connection.end();
}
