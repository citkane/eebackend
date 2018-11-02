"use strict";
const {init} = require("./lib/init.js");
const {Log} = require("./lib/globals");

init((err)=>{
	if(err){
		Log.error("Shutting down, check the logs for more details");
		process.exit();
	}
	console.log("Starting the loops");
})