"use strict";
const fs = require("fs");
const path = require("path");
const {init} = require("./lib/init.js");
const {Log} = require("./lib/globals");
const {rpc} = require("./cli/rpcServer");
const portFile = path.join(__dirname,"cli/.port");
const mode = process.argv[2];
if(mode !== "production" && mode !=="development"){
	error("Please start the application with `npm run server` or `node electricity development`.");
}
Log.info(" ");
Log.info("------------------------------------------------ Server has started\n");
process.on("beforeExit",(code)=>{
	Log.info("------------------------------------------------ Server has stopped"+code+"\n");
	process.exit();
})


//initialise the database
const boot1 = (err)=>{
	if(err) error(err);
	rpc(boot2)
}

//start the rpc server for cli
const boot2 = (err)=>{
	if(err) error(err);
	boot3();
}


//start the logic loops
const boot3 = (err)=>{
	if(err) error(err);
	console.log("Starting the loops");
}

init(boot1);

function error(err){
	if(typeof err !== "boolean") Log.error(err);
	Log.error("Shutting down, check the logs for more details");
	process.exit();
}

function exitHandler(exitCode) {
	if(fs.existsSync(portFile)) fs.unlinkSync(portFile);
	Log.info("------------------------------------------------ Server has stopped ["+exitCode+"]\n");
	process.exit();
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);
process.on('uncaughtException', exitHandler);