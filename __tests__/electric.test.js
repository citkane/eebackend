"use strict";
/*eslint no-console: ["error", { allow: ["log"] }] */

const fs = require("fs");
const path = require("path");
const rootDir = path.join(__dirname,"../");
const settingsFile = path.join(rootDir,"database/settings.json");
const queries = require("../database/queries");
const {storeDatabase,state} = require("../lib/globals");
const sql = require("../lib/sql");
let database,settings;
if(fs.existsSync(settingsFile)) settings = require(settingsFile);
if(settings.database) database = settings.database;

afterAll(() => {
	return sql.closeDB();
});

describe("Are database settings present",()=>{
	test("Does the settings file exists",()=>{
		expect(fs.existsSync(settingsFile)).toBe(true);
	});
	test("Are all the settings filled in",()=>{
		expect(
			!database && Object.keys(database).some((key)=>{
				return !database[key];
			})
		).toBe(false);
	});
});

describe("Database functionality",()=>{
	storeDatabase(database);
	queries.escapeGlobals();
	const builder = {
		makeTable:[queries.makeTables,[]],
		dsu:[queries.make.dsu,["dsu description"]],
		site:[queries.make.site,["site nickname",1]],
		setPower:[queries.set.power,[1]],
		setTotal:[queries.set.totalPower,[1]],
		deleteSite:[queries.delete.site,[1]],
		deleteDsu:[queries.delete.dsu,[1]],
		move:[queries.set.move,[1,2]],
		getAll:[queries.get.all,[]],
		tables:[queries.getTables,[]],
	};
	test("Do all the query builders return strings and log outputs to console",()=>{
		expect(
			Object.keys(builder).some((key)=>{
				const fnc = builder[key][0];
				const args = builder[key][1];
				const returned = fnc(args[0],args[1]);
				console.log(`/********* ${key} *********/`,"\n",returned);
				return typeof returned !== "string";
			})
		).toBe(false);
	});
	test("Connect to the database",done=>{
		function callback(err) {
			if(err) console.log(err);
			expect(err).toBeFalsy();
			done();
		}
		sql.makeConnection(callback);
	});
	test("Create database tables",done=>{
		function callback(err) {
			if(err) console.log(err);
			expect(err).toBeFalsy();
			done();
		}
		sql.checkDatabase(callback);
	});
	test("Make a DSU",done=>{
		function callback(err) {
			if(err) console.log(err);
			expect(err).toBeFalsy();
			done();
		}
		sql.make.dsu("a test dsu",callback);
	});
	test("Error a DSU without description",done=>{
		function callback(err) {
			expect(err).toBeDefined();
			done();
		}
		sql.make.dsu(null,callback);
	});
	test("Make a SITE with a nickname",done=>{
		function callback(err) {
			if(err) console.log(err);
			expect(err).toBeFalsy();
			done();
		}
		sql.make.site(1,callback,"a test site");
	});
	test("Make a SITE without a nickname",done=>{
		function callback(err) {
			if(err) console.log(err);
			expect(err).toBeFalsy();
			done();
		}
		sql.make.dsu("a test dsu2",()=>{
			sql.make.site(2,callback);
		});
		
	});
	test("Error a SITE with incorrect key constraint",done=>{
		function callback(err) {
			expect(err).toBeDefined();
			done();
		}
		sql.make.site(1000,callback);
	});
	
	test("Delete a site",done=>{
		function callback(err) {
			if(err) console.log(err);
			expect(err).toBeFalsy();
			done();
		}
		sql.delete.sites([1],callback);
	});
	
	test("Delete a dsu",done=>{
		function callback(err) {
			if(err) console.log(err);
			expect(err).toBeFalsy();
			done();
		}
		sql.delete.dsu(1,callback);
	});

	test("Error Delete a dsu which has referenced site",done=>{
		function callback(err) {
			expect(err).toBeDefined();
			done();
		}
		sql.delete.dsu(2,callback);
	});
	test("Move a site to different DSU",done=>{
		function callback(err) {
			if(err) console.log(err);
			expect(err).toBeFalsy();
			done();
		}
		sql.make.dsu("replace dsu",()=>{
			sql.move([2],3,callback);
		});
		
	});
	test("Fetch all data",done=>{
		function callback(err){
			if(err) console.log(err);
			expect(err).toBeFalsy();
			done();
		}
		sql.make.site(2,()=>{
			sql.get.all(callback);
		});
	});
	test("Update site power",done=>{
		function callback(err) {
			if(err) console.log(err);
			expect(err).toBeFalsy();
			done();
		}
		sql.loopSites(callback);
	});
	test("Aggregate DSU power",done=>{
		function callback(err) {
			if(err) console.log(err);
			expect(err).toBeFalsy();
			done();
		}
		sql.loopDsus(callback);
	});
});

describe("In memory data store",()=>{
	test("Does the store exist",()=>{
		expect(state).toHaveProperty("dsus");
	});
	test("Data is retrieved from the store correctly",done=>{
		function callback(err){
			let bad = err?true:false;
			if(!bad){
				const results = [];
				const keys = state.dsus.keys();
				results.push(keys);
				results.push(state.dsus.keyPairs());
				for(let key of keys){
					results.push(state.dsus.siteKeys(key));
					results.push(state.dsus.sitePairs(key));
				}
				results.push(state.dsus.allSites().keys);
				results.push(state.dsus.allSites().pairs);
				bad = results.some((result)=>{
					return !(typeof result === "object" && result.length);
				});
			}
			expect(bad).toBe(false);
			done();
		}
		sql.make.site(1,()=>{
			sql.get.all(callback);
		},"replacement site");
	});
});
