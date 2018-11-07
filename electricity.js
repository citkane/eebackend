"use strict";

const fs = require("fs");
const path = require("path");
const {init} = require("./lib/init");
const {Log,state} = require("./lib/globals");
const {loopSites,loopDsus,get,closeDB} = require("./lib/sql");
const {rpc} = require("./cli/rpcServer");
const portFile = path.join(__dirname,"cli/.port");

if(state.env !== "production" && state.env !=="development"){
	error("Please start the application with `npm run production` or `npm run development`.");
}

Log.info(" ");
Log.info("------------------------------------------------ Server has started\n");


/****************** Start Boot sequence **************/

//start the rpc server for cli
const boot1 = (err)=>{	
	if(err) error(err);
	if(process.argv[3] === "install"){
		console.log("\nINSTALLED\nPlease start with`npm run production` or `npm run development`\nA production server can be stopped with `npm run stop`\nA remote console interface is available with `npm run cli\n");
		process.exit();
	}else{
		rpc(boot2);
	}	
};

//update the data model;
const boot2 = ()=>{
	get.all(boot3);
};


//start the logic loops
const frequency = 1000;
const boot3 = (err)=>{	
	if(err) error(err);
	/* 
	** These could effectively be combined into a single loop and query group, 
	** improving the timeliness of total_power vs. single query performance.
	**
	** Set `state.singleLoopStrategy = true` to enable a single loop.
	*/
	state.singleLoopStrategy = false;
	Log.info(`Starting the ${state.singleLoopStrategy?"loop":"loops"}`);

	setInterval(()=>{
		loopSites();
	},frequency);

	if(!state.singleLoopStrategy){
		setTimeout(()=>{
			setInterval(()=>{
				loopDsus();
			},frequency);
		},frequency/2);	
	}
};

init(boot1); //initialise the database

/****************** End Boot sequence **************/

function error(err){
	if(typeof err !== "boolean"){
		Log.error(err.stack||err);
	}else{
		Log.error("Shutting down, check the logs for more details");
	}
	process.exit("SIGINT");
}

function exitHandler(err,exitCode) {
	if(err) Log.error(err.stack);
	Log.info("------------------------------------------------ Server has stopped ["+exitCode+"]\n");
	if(fs.existsSync(portFile)) fs.unlinkSync(portFile);
	closeDB();
	process.exit();
}

process.on("exit",(code)=>{
	exitHandler(null,code);
});
process.on("SIGINT",()=>{
	exitHandler(null,"SIGINT");
});
process.on("SIGUSR1",()=>{
	exitHandler(null,"SIGUSR1");
});
process.on("SIGUSR2",()=>{
	exitHandler(null,"SIGUSR2");
});
process.on("uncaughtException",(err)=>{
	exitHandler(err,"uncaughtException");
});