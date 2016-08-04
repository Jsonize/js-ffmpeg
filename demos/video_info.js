var jsffmpeg = require(__dirname + "/../index.js");

var args = require('node-getopt').create([
	["", "source=FILE", "source video"]	
]).bindHelp().parseSystem().options;

jsffmpeg.ffprobe_simple(args.source).success(function (data) {
	console.log(data);
});