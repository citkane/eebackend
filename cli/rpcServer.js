"use strict"

const fs = require("fs");
const op = require("openport");
const path = require("path");
const dnode = require('dnode');
const {Log} = require("../lib/globals");

exports.rpc = function(callback){
	op.find(
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
}

function serve(port){
	const server = dnode(api);
	server.listen(port);
}

const api = {
	test:function(){
		Log.info("test API");
	},
	make_site:function(nickname,callback){
		Log.info(nickname);
		callback();
	},
	make_dsu:function(nickname,callback){
		Log.info(nickname);
		callback();
	}
}
