"use strict";

const prompt = require("prompt");
const fs = require('fs-extra');
const path = require('path');

const {database,Log,fileRoot} = require("./globals");
const {makeConnection,checkDatabase} = require("./sql");
const settingsTempFile = path.join(fileRoot,"database/settings_temp.json");
const settingsFile = path.join(fileRoot,"database/settings.json");

if(!fs.existsSync(settingsFile)) fs.copyFileSync(settingsTempFile,settingsFile);
const Settings = require("../database/settings.json");

const noSettings = Object.keys(Settings.database).some((key)=>{
	return !Settings.database[key];
})

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
			storeSettings(settings);
			writeSettings(settings);
			checkDatabase();
		})
	}
	makeSettings(makeCallback);
}else{
	checkSettings(Settings.database,(err)=>{
		if(err){
			Log.error(err);
			return;
		}
		storeSettings(Settings.database);
		checkDatabase();
	}); 
}
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
			callback(false,"An error occurred while inputting data")
			return; 
		}
		callback(result)
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
	}
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
function storeSettings(settings){
	for(let key of Object.keys(settings)){
		database[key] = settings[key];
	}
}

