"use strict";

const mysql  = require("mysql");
const {database,Log,state} = require("./globals");
const query = require("../database/queries");
const test = state.test;
const requiredTables = test?["test_site_power","test_dsu_power","test_dsus"]:["site_power","dsu_power","dsus"];
let pool;

exports.makeConnection = function(callback,settings){
	if(!settings) settings = database;
	pool = mysql.createPool({
		connectionLimit : 20,
		host:settings.db_host,
		port:settings.db_port,
		user:settings.user,
		password:settings.password,
		database:settings.db_name,
		multipleStatements: true
	});
	pool.getConnection((err)=>{
		callback(err);
	});
};
exports.checkDatabase = function(callback){
	query.escapeGlobals();
	let q = query.getTables();
	pool.query(q,(err,results)=>{
		if (err){
			callback(err);
			return;
		}
		results = results.map((result)=>{
			return result.TABLE_NAME;
		});

		const tableMissing = requiredTables.some((table)=>{
			return results.indexOf(table) === -1;
		});
		if(tableMissing){
			q = query.makeTables();
			pool.query(q,(err,results)=>{
				if (err){
					callback(err);
					return;
				}
				if(results.length === requiredTables.length){
					Log.info("All tables created successfully");
					callback();
				}else{
					callback("Could not create all required databases");
				}
			});
		}else{
			Log.info("All databases already exist");
			callback();
		}
	});
};

exports.make = {
	site:(id,callback,nickname)=>{
		let q = query.make.site(nickname,id);
		pool.query(q,(err)=>{
			if(err){
				Log.error(err);
				callback(err);
				return;
			}
			test?callback(err):get.all(callback);
		});
	},
	dsu:(description,callback)=>{
		let q = query.make.dsu(description);
		pool.query(q,(err)=>{
			if(err){
				Log.error(err);
				callback(err);
				return;
			}
			test?callback(err):get.all(callback);
		});
	}
};
const get = exports.get = {
	all:(callback)=>{
		let q = query.get.all();
		
		pool.query(q,(err,results)=>{
			if(err){
				Log.error(err);
				callback(err);
				return;
			}
			if(results && results.length){
				let info = {};
				for(let row of results){
					if(!info[row.did]) info[row.did] = {
						description:row.description,
						time_aggregated:row.time_aggregated,
						total_power:row.total_power,
						sites:{}
					};
					if(row.sid && !info[row.did].sites[row.sid]){
						info[row.did].sites[row.sid] = {
							nickname:row.nickname,
							power:row.power,
							time_sent:row.time_sent
						};
					}
				}
				state.dsus.set(info);
				
			}else{
				state.dsus.set({});
			}
			callback(err);
		});
	}
};
exports.delete = {
	sites:(ids,callback)=>{
		let q = "";
		for (let id of ids){
			q+= query.delete.site(id);
		}
		pool.query(q,(err)=>{
			if(err){
				Log.error(err);
				callback(err);
				return;
			}
			test?callback(err):get.all(callback);
		});
	},
	dsu:(id,callback)=>{		
		let q = query.delete.dsu(id);
		pool.query(q,(err)=>{
			if(err){
				Log.error(err);
				callback(err);
				return;
			}
			test?callback(err):get.all(callback);
		});
	}
};
exports.move = (ids,target,callback)=>{
	let q = "";
	for (let id of ids){
		q+= query.set.move(id,target);
	}
	pool.query(q,(err)=>{
		if(err){
			Log.error(err);
			callback(err);
			return;
		}
		test?callback(err):get.all(callback);
	});
};
exports.loopSites = function(callback){
	let q = "";
	for (let id of state.dsus.allSites().keys){
		q += query.set.power(id);
	}
	if(state.singleLoopStrategy){
		for (let id of state.dsus.keys()){
			q += query.set.totalPower(id);
		}
	}
	if(q) pool.query(q,(err)=>{
		if(err) Log.error(err);
		if(callback) callback(err);
	});
};
exports.loopDsus = function(callback){
	let q = "";
	for (let id of state.dsus.keys()){
		q += query.set.totalPower(id);
	}
	if(q) pool.query(q,(err)=>{
		if(err) Log.error(err);
		if(callback) callback(err);
	});
};
exports.closeDB = function close(err){
	if(err) Log.error(err);
	if(test){
		const q = `DROP TABLE IF EXISTS ${requiredTables.join(",")}`;
		pool.query(q,(err)=>{
			if(err) Log.error(err);
			pool.end();
		});
		return;
	}
	pool.end();
};
