"use strict"
const {createLogger,format,transports} = require("winston");
const {combine,timestamp,printf,splat} = format;
require('winston-daily-rotate-file');

exports.fileRoot = process.cwd();
exports.database = {};

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
	level: 'info',
	format: combine(timestamp(),splat(),jsonFormatter),
	transports: [
		new transports.DailyRotateFile({filename:'%DATE%_error.log',dirname:"logs",level:'error',maxFiles:"7d"}),
		new transports.DailyRotateFile({filename:'%DATE%_combined.log',dirname:"logs",maxFiles:"7d"}),
		new transports.Console({level:'error'})
	]
});
/* End Logging functions */