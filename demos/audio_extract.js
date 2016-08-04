var jsffmpeg = require(__dirname + "/../index.js");

var args = require('node-getopt').create([
	["", "source=FILE", "source video"],	
	["", "target=FILE", "target audio"]
]).bindHelp().parseSystem().options;

jsffmpeg.ffmpeg_simple(args.source, {
	output_type: "audio"
}, args.target);