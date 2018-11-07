"use strict";
/*eslint no-console: ["error", { allow: ["log"] }] */

const colors = require("colors/safe");
const prompt = require("prompt");
const errorMessage = "An error occurred, please check the logs for details\n";

exports.init = function(Do,formatPairs,line,bold,api){
	const prompts = exports.prompts = {
		command:()=>{
			const schema = {
				properties: {
					command:{
						description:colors.green("command"),
						enum:Object.keys(Do),
						message:"That command was not found, try again or enter (help)"
					}
				}
			};
			prompt.get(schema,function(err,result){
				if(!err && result.command){
					Do[result.command]();
				}else{
					if(err) console.log(err);
					prompts.command();
				}
			});
		},
		make:(data)=>{
			const schema = {
				properties: {
					type: {
						description:line(`Make a (${bold("site")}) or (${bold("dsu")}) or (${bold("c")}) to cancel`),
						enum:["site","dsu","c"],
						message: "Input must be (site) or (dsu)",
						required: true,
					},
					dsu: {
						description:line(`Enter a (${bold("description")}) for this dsu or (${bold("c")}) to cancel`),
						type:"string",
						ask:function(){
							const val = prompt.history("type").value;
							return (val!=="c" && val!=="site");
						},
						required: true,
						message: "A description is required"
					},
					site:{
						description:line(`Enter a (${bold("nickname")}) for this site, (${bold("enter")}) for none or (${bold("c")}) to cancel`),
						type:"string",
						ask:function(){
							const val = prompt.history("type").value;
							return (val!=="c" && val!=="dsu");
						}
					},
					id:{
						required: true,
						description:line(`Enter the (${bold("id")}) of the DSU for this site or (${bold("c")}) to cancel`),
						message: "No DSU with that id was found.",
						ask:()=>{
							let val;
							if(prompt.history("site")) val = prompt.history("site").value;
							const val2 = prompt.history("type").value;
							let good =  (val!=="c" && val2!=="dsu" && val2!=="c");
							if (good) console.log(data.keyPairs.length?formatPairs(data):`There are no DSUs yet to add a site to, please ${bold("make")} one first. (${bold("c")}) to cancel`);
							return good;
						},
						conform:function(value){
							if(value !== "c") value = parseFloat(value);
							return value === "c"||data.keys.indexOf(value)!==-1;
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
				});
				if(cancelled){
					console.log(" ");
					prompts.command();
					return;
				}
				api["make_"+result.type](result,(err)=>{
					console.log(err?errorMessage:`${result.type==="site"?"Site":"DSU"} was successfully added\n` );
					prompts.command();
				});
			});
		},
		delete:(data)=>{
			const schema = {
				properties: {
					type: {
						description:line(`Delete (${bold("sites")}) or (${bold("dsu")}) or (${bold("c")}) to cancel`),
						enum:["sites","dsu","c"],
						message: "Input must be (sites) or (dsu)",
						required: true,
					},
					dsu: {
						description:line(`Enter a (${bold("id")}) for the dsu to be deleted or (${bold("c")}) to cancel`),
						ask:function(){
							const val = prompt.history("type").value;
							const good = (val!=="c" && val!=="sites");
							if (good) console.log(data.keyPairs.length?formatPairs(data):`There are no DSUs to delete,(${bold("c")}) to cancel`);
							return good;
						},
						required: true,
						message: "Could not find a DSU with that id",
						conform:function(value){
							if(value !== "c") value = parseFloat(value);
							return value === "c"||data.keys.indexOf(value)!==-1;
						}
					},
					sites:{
						description:line(`Enter (${bold("id,id2,...")}) for the site[s] to be deleted or (${bold("c")}) to cancel`),
						ask:function(){
							const val = prompt.history("type").value;
							const good = (val!=="c" && val!=="dsu");
							if (good) console.log(data.all.pairs.length?data.all.pairs.join(" | "):`There are no Sites to delete,(${bold("c")}) to cancel`);
							return good;
						},
						required: true,
						message: "Could not find a Site with that id",
						conform:function(value){
							if (value !== "c") value = `[${value}]`;
							try{
								value = JSON.parse(value);
							}
							catch(err){
								value = value.toString();
							}
							let good = (typeof value === "object" && value.length)||value === "c";
							if(good && value !== "c"){
								const sites = data.all.keys;
								good = !value.some((id)=>{
									return sites.indexOf(id) === -1;
								});
							}
							return good;
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
				});
				if(cancelled){
					console.log(" ");
					prompts.command();
					return;
				}
				api["delete_"+result.type](result,(err)=>{
					if(err && (err.message||err).includes("ER_ROW_IS_REFERENCED")){
						console.log(
`DSU with id ${bold(result.dsu)} contains Sites:
${data.sites[result.dsu].pairs.join(" | ")}
Please first ${bold("delete")} or ${bold("move")} all Sites.
							`
						);
					}else{
						console.log(err?errorMessage:`${result.type==="sites"?"Site[s] were":"DSU was"} deleted\n` );
					}
					prompts.command();
				});
			});
		},
		list:(data)=>{
			const schema = {
				properties:{
					dsu: {
						description:line(`Enter a DSU (${bold("id")}) or (${bold("c")}) to cancel`),
						message: "No DSU with that id was found",
						ask:function(){
							console.log(data.keyPairs.length?formatPairs(data):`There are no DSUs or sites to list,(${bold("c")}) to cancel`
							);
							return true;
						},
						conform:function(value){
							if(value !== "c") value = parseFloat(value);
							return value === "c"||data.keys.indexOf(value)!==-1;
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
				});
				if(cancelled || !result.dsu){
					console.log(" ");
					prompts.command();
					return;
				}
				console.log(data.sites[result.dsu].pairs.length?data.sites[result.dsu].pairs.join(" | ")+"\n":`There a no sites on this DSU id ${bold(result.dsu)}\n`);
				prompts.command();
			});
		},
		move:(data)=>{
			const schema = {
				properties:{
					from:{
						description:line(`Enter which DSU you want to move FROM (${bold("id")}) or (${bold("c")}) to cancel`),
						message: "No DSU with that id was found",
						ask:function(){
							console.log(data.keyPairs.length?formatPairs(data):`There are no DSUs to move from,(${bold("c")}) to cancel`
							);
							return true;
						},
						conform:function(value){
							if(value !== "c") value = parseFloat(value);
							return value === "c"||data.keys.indexOf(value)!==-1;
						},
						required: true,
					},
					sites:{
						description:line(`Select the Site[s] you want to move (${bold("id,id2,...")}) or (${bold("c")}) to cancel`),
						message: "Each id in the input must exist in the DSU",
						type:"string",
						ask:function(){
							const dsu = prompt.history("from").value;
							if(dsu === "c") return false;
							console.log(data.sites[dsu].pairs.length?data.sites[dsu].pairs.join(" | "):`There are no Sites in the DSU,(${bold("c")}) to cancel`
							);
							return true;
						},
						required: true,
						conform:function(value){

							if (value !== "c") value = `[${value}]`;
							try{
								value = JSON.parse(value);
							}
							catch(err){
								value = value.toString();
							}
							let good = (typeof value === "object" && value.length)||value === "c";
							if(good && value !== "c"){
								const dsu = prompt.history("from").value;
								const sites = data.sites[dsu].keys;
								good = !value.some((id)=>{
									return sites.indexOf(id) === -1;
								});
							}
							return good;
						}
					},
					to:{
						description:line(`Enter the DSU you want to move the sites TO (${bold("id")}) or (${bold("c")}) to cancel`),
						message: "No DSU with that id was found",
						ask:function(){
							const dsu = prompt.history("from").value;
							const sites = prompt.history("sites")?prompt.history("sites").value:false;
							if(dsu === "c" || sites === "c") return false;
							console.log(data.keyPairs.length?formatPairs(data):`There are no DSUs to move from,(${bold("c")}) to cancel`
							);
							return true;
						},
						conform:function(value){
							if(value !== "c") value = parseFloat(value);
							return value === "c"||data.keys.indexOf(value)!==-1;
						},
						required: true,
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
				});
				if(cancelled){
					console.log(" ");
					prompts.command();
					return;
				}
				api.move(result,(err)=>{
					console.log(err?errorMessage:"Site[s] were successfully moved\n" );
					prompts.command();
				});
			});
		}
	};
};

