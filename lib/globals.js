"use strict";
const {createLogger,format,transports} = require("winston");
const {combine,timestamp,printf,splat} = format;
require("winston-daily-rotate-file");

exports.fileRoot = process.cwd();
exports.database = {};
exports.storeDatabase = function(settings){
	for(let key of Object.keys(settings)){
		exports.database[key] = settings[key];
	}
};

const tree = function(){
	this.val = {};
};
tree.prototype.set = function(val){
	this.val = val;
};
tree.prototype.keys = function(){
	return Object.keys(this.val).map((id)=>{
		return parseFloat(id);
	});
};
tree.prototype.keyPairs = function(){
	return Object.keys(this.val).map((id)=>{
		return `${this.val[id].description} (${id})`;
	});
};
tree.prototype.siteKeys = function(id){
	if(!id) return false;
	return Object.keys(this.val[id].sites).map((id)=>{
		return parseFloat(id);
	});
};
tree.prototype.sitePairs = function(id){
	if(!id) return false;
	return Object.keys(this.val[id].sites).map((sid)=>{
		return `${this.val[id].sites[sid].nickname||"unnamed"} (${sid})`;
	});
};
tree.prototype.allSites = function(){
	let sites = [];
	let sitePairs = [];
	for (let id of this.keys()){
		sites = sites.concat(this.siteKeys(id));
		sitePairs = sitePairs.concat(this.sitePairs(id));
	}
	return {
		keys:sites,
		pairs:sitePairs
	};
};

exports.state = {
	dsus:new tree(),
	singleLoopStrategy:false,
	env:process.argv[2],
	test:(process.argv[2] !== "production" && process.argv[2] !== "development")
};

exports.getRandom = function(){
	const min = 1;
	const max = 1000;
	let r = Math.random()*(max - min)+min;
	return (Math.round(r*10000))/10000;
};

/* Logging functions */
const dateOptions = {
	day:"numeric",
	month:"numeric",
	year:"numeric",
	hour:"numeric",
	minute:"numeric",
	second:"numeric"
};
const jsonFormatter = printf(info => {
	const date  = new Date(info.timestamp).toLocaleDateString(false,dateOptions);
	const message  = typeof info.message === "object"?JSON.stringify(info.message,false,2):info.message?info.message.toString():"undefined";
	return `${date} [${info.level}] ${message}`;
});
exports.Log = createLogger({
	level: "info",
	format: combine(timestamp(),splat(),jsonFormatter),
	transports: [
		new transports.DailyRotateFile({filename:"%DATE%_error.log",dirname:"logs",level:"error",maxFiles:"7d"}),
		new transports.DailyRotateFile({filename:"%DATE%_combined.log",dirname:"logs",maxFiles:"7d"}),
		new transports.Console({level:"error"})
	]
});
/* End Logging functions */