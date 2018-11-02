"use strict";

const fs = require("fs");
const path = require("path");
var dnode = require('dnode');
const prompt = require("prompt");
const portFile = path.join(__dirname,".port");
const logoFile = path.join(__dirname,"logo.txt");
let helpFile = path.join(__dirname,"help.txt");
const helpLines = {};
if(!fs.existsSync(portFile)){
	console.log(`

Server is not running.
Run the server with 'npm run server' and try again.
Exiting the CLI.

	`);
	process.exit();
}
let api;
const port = fs.readFileSync(portFile).toString();
const rpc = dnode.connect(port);
rpc.on("remote",function(remote){
	api = remote;
	startConsole();
})

function startConsole(){
	helpFile = fs.readFileSync(helpFile).toString();
	parseCommands();
	const logo = fs.readFileSync(logoFile).toString();
	console.log(logo);
	console.log(`
Welcome to the Electricity Exchange control interface.
To quite the console, enter (q)
For help, enter (help)
Documentation is at https://github.com/citkane/eebackend

	`)
	prompt.message = "ElectricEx";
	prompt.delimiter = ": "
	prompt.start();
	prompts.command();
}

const prompts = {
	command:()=>{
		prompt.get("command",function(err,result){
			if(Do[result.command]){
				Do[result.command]();
			}else{
				console.log(`Command '${result.command}' not found, try again or type 'help'`);
				prompts.command();
			}
		})
	},
	make:()=>{
		const schema = {
			properties: {
				type: {
					description:"make a (site) or (dsu) or (c) to cancel",
					enum:["site","dsu","c"],
					message: "input must be (site) or (dsu)",
					required: true,
				},
				dsu: {
					description:"Enter a nickname for this dsu, (enter) for none or (c) to cancel",
					ask:function(){
						const val = prompt.history('type').value;
						return (val!=="c" && val!=="site");
					}
				},
				site:{
					description:"Enter a nickname for this site, (enter) for none or (c) to cancel",
					ask:function(){
						const val = prompt.history('type').value;
						return (val!=="c" && val!=="dsu");
					}
				}
			}
		};
		prompt.get(schema,function(err,result){
			if(err){
				console.log(err);
				return;
			}
			const cancelled = Object.keys(result).some((key)=>{
				return result[key] === "c";
			})
			if(cancelled){
				prompts.command();
				return;
			}
			api["make_"+result.type](result[result.type],(err)=>{
				if(!err){
					console.log(result);
					
				}else{
					console.log(err);
				}
				prompts.command();
			})
			
		})
	}
}

const Do = {
	q:()=>{
		console.log("\nGoodbye!\n");
		process.exit();
	},
	help:()=>{
		console.log(helpFile);
		prompts.command();
	},
	make:()=>{
		console.log(helpLines.make);
		prompts.make();
	},
	move:()=>{
		console.log(helpLines.move);
		prompts.command();
	},
	delete:()=>{
		console.log(helpLines.delete);
		prompts.command();
	},
	report:()=>{
		console.log(helpLines.report);
		prompts.command();
	},
	list:()=>{
		console.log(helpLines.list);
		prompts.command();
	}
}

function parseCommands(){
	let parsed = helpFile.trim().split("\n");
	parsed.shift();
	parsed = parsed.forEach((line)=>{
		if(line){
			const duo = line.split(":");
			helpLines[duo[0].trim()] = duo[1].trim()
		}
	})
}