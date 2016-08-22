var jsffmpeg = require(__dirname + "/../index.js");

var args = require('node-getopt').create([
	["", "source=FILE", "source video"],
	["", "target=FILE", "target video"]
]).bindHelp().parseSystem().options;

jsffmpeg.ffmpeg_simple(args.source, {
	width: 640,
	height: 480
}, args.target).success(function (data) {
	console.log(data);
});