var jsffmpeg = require(__dirname + "/../index.js");

var args = require('node-getopt').create([
	["", "source=FILE", "source video"],	
	["", "target=FILE", "target image"]
]).bindHelp().parseSystem().options;

jsffmpeg.ffmpeg_simple(args.source, {
	output_type: "image",
	image_percentage: 0.5
}, args.target);