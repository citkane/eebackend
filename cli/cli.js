"use strict";
/*eslint no-console: ["error", { allow: ["log"] }] */

const fs = require("fs");
const path = require("path");
var dnode = require("dnode");
const prompt = require("prompt");
const colors = require("colors/safe");
const portFile = path.join(__dirname,".port");
const logoFile = path.join(__dirname,"logo.txt");
let helpFile = path.join(__dirname,"help.txt");
let api,Prompts;

if(!fs.existsSync(portFile)){
	console.log(`

Server is not running.
Run the server with "npm run production" or "npm run development" and try again.
Exiting the CLI.

	`);
	process.exit();
}
const port = fs.readFileSync(portFile).toString();
const rpc = dnode.connect(port);
rpc.on("remote",function(remote){
	api = remote;
	const {init} = require("./prompts");
	init(Do,formatPairs,line,bold,api);
	const {prompts} = require("./prompts");
	Prompts = prompts;
	startConsole();	
});

function startConsole(){
	helpFile = fs.readFileSync(helpFile).toString();
	const logo = fs.readFileSync(logoFile).toString();
	console.log(line(logo));
	console.log(`
${bold("Welcome to the Electricity Exchange control interface")}

To quite the console, enter (${bold("q")}) from a ${line("command:")} prompt
For help, enter (${bold("help")}) from a ${line("command:")} prompt

Documentation is at https://github.com/citkane/eebackend

	`);
	prompt.message = colors.dim("ElectricEx");
	prompt.delimiter = ": ";
	prompt.start();
	Prompts.command();
}



const Do = {
	q:()=>{
		console.log("\nGoodbye!\n");
		process.exit();
	},
	help:()=>{
		console.log(helpFile);
		Prompts.command();
	},
	make:()=>{
		console.log(" ");
		api.getData((data)=>{
			Prompts.make(data);
		});
	},
	move:()=>{
		console.log(" ");
		api.getData((data)=>{
			Prompts.move(data);
		});
	},
	delete:()=>{
		console.log(" ");
		api.getData((data)=>{
			Prompts.delete(data);
		});		
	},
	report:()=>{
		console.log(" ");
		api.report((err,file)=>{
			if(err){
				console.log(err);
			}else{
				console.log(`The report has been filed to "${file}"\n`);
			}
			Prompts.command();
		});
	},
	list:()=>{
		console.log(" ");
		api.getData((data)=>{
			Prompts.list(data);
		});		
	}
};

function bold(text){
	return colors.bold(text);
}
function line(text){
	return colors.green(text);
}
function formatPairs(data){
	return data.keyPairs.map((pair,i)=>{
		const id = data.keys[i];
		return pair + colors.dim(`[${data.sites[id].pairs.length}]`);
	}).join(" | ");
}