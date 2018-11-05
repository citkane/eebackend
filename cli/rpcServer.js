"use strict";

const fs = require("fs");
const openPort = require("openport");
const path = require("path");
const dnode = require("dnode");
const sql = require("../lib/sql");
const {state,fileRoot,Log} = require("../lib/globals");

exports.rpc = function(callback){
	openPort.find(
		{
			startingPort: 8000,
			endingPort: 9000
		},
		function(err, port) {
			if(err) {
				callback(err);
				return;
			}
			const file = path.join(__dirname,".port");
			fs.writeFileSync(file,port);
			serve(port);
			callback();
		}
	);
};

function serve(port){
	const server = dnode(api);	
	server.listen(port);
}

const api = {

	make_site:function(result,callback){
		sql.make.site(result.id,callback,result.site);
	},
	make_dsu:function(result,callback){
		sql.make.dsu(result.dsu,callback);
	},
	delete_sites:function(result,callback){
		try{
			result.sites = JSON.parse(`[${result.sites}]`);
		}
		catch(err){
			Log.error(err);
			callback(err);
			return;
		}
		sql.delete.sites(result.sites,callback);
	},
	delete_dsu:function(result,callback){
		sql.delete.dsu(result.dsu,callback);
	},
	move:function(result,callback){
		try{
			result.sites = JSON.parse(`[${result.sites}]`);
		}
		catch(err){
			Log.error(err);
			callback(err);
			return;
		}
		sql.move(result.sites,result.to,callback);
	},
	report:function(callback){
		sql.get.all((err)=>{
			let file;
			if(!err){
				try{
					let string = JSON.stringify(state.dsus.val,null,"\t");
					file = new Date().toString()+".json";
					file = file.replace(/ /g,"_").trim();
					file = path.join(fileRoot,"reports",file);
					fs.writeFileSync(file,string);
				}
				catch(e){
					err = e;
				}
			}
			callback(err,file);
		});
	},
	getData:function(callback){
		const keys = state.dsus.keys();
		const sites = {};
		for (let key of keys){
			if(!sites[key]) sites[key] = {};
			sites[key].keys = state.dsus.siteKeys(key);
			sites[key].keys.push("c");
			sites[key].pairs = state.dsus.sitePairs(key);
		}
		const all = state.dsus.allSites();
		all.keys.push("c");
		keys.push("c");
		callback({
			keys:keys,
			keyPairs:state.dsus.keyPairs(),
			sites:sites,
			all:all
		});
	},

};
