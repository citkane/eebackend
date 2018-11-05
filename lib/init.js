"use strict";
/*eslint no-console: ["error", { allow: ["info"] }] */

const prompt = require("prompt");
const fs = require("fs-extra");
const path = require("path");

const {storeDatabase,Log,fileRoot} = require("./globals");
const {makeConnection,checkDatabase} = require("./sql");
const settingsTempFile = path.join(fileRoot,"database/settings_temp.json");
const settingsFile = path.join(fileRoot,"database/settings.json");

if(!fs.existsSync(settingsFile)) fs.copyFileSync(settingsTempFile,settingsFile);
const Settings = require("../database/settings.json");

const noSettings = Object.keys(Settings.database).some((key)=>{
	return !Settings.database[key];
});
exports.init = function(callback){
	if(noSettings){
		const makeCallback = (settings,err)=>{
			if(err){
				Log.error(err);
				return;
			}
			checkSettings(settings,(err)=>{
				if(err){
					Log.error(err);
					makeSettings(makeCallback);				
					return;
				}
				storeDatabase(settings);
				writeSettings(settings);
				checkDatabase(callback);
			});
		};
		makeSettings(makeCallback);
	}else{
		checkSettings(Settings.database,(err)=>{
			if(err){
				Log.error(err);
				return;
			}
			storeDatabase(Settings.database);
			checkDatabase(callback);
		}); 
	}
};

function makeSettings(callback){
	const promptSchema = {
		properties: {}
	};
	for(let key of Object.keys(Settings.database)){
		promptSchema.properties[key] = {
			type:"string",
			required:true,
			description:key,
			message:`${key} is required`
		};
	}
	promptSchema.properties.db_port.type = "number";
	promptSchema.properties.db_port.default = 3306;
	promptSchema.properties.db_host.default = "localhost";
	promptSchema.properties.password.hidden = true;
	console.info("Please enter the database details.");
	prompt.start();
	prompt.get(promptSchema,(err, result)=>{
		if (err){
			callback(false,"An error occurred while inputting data");
			return; 
		}
		callback(result);
	});
}
function checkSettings(settings,callback){
	makeConnection((err)=>{
		callback(err);
	},settings);
}
function writeSettings(settings){
	let db = {
		database:settings
	};
	try{
		db = JSON.stringify(db,null,"\t");
		fs.writeFileSync(settingsFile,db);
		Log.info(`Wrote settings to ${settingsFile}`);
	}
	catch(err){
		Log.error(err);
		return;
	}
}

exports.sum = function(a,b){
	return a+b;
};
