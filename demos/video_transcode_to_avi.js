var jsffmpeg = require(__dirname + "/../index.js");

var args = require("node-getopt").create([
	["", "source=FILE", "source video"],
	["", "target=FILE", "target video"],
	["", "width=WIDTH", "target width"],
	["", "height=HEIGHT", "target height"],
	["", "watermark=FILE", "watermark image"],
	["", "docker=CONTAINER", "docker"],
	["", "timeout=MS", "timeout"],
	["", "ratiostrategy=STRATEGY", "ratio strategy", "fixed"],
	["", "sizestrategy=STRATEGY", "size strategy", "keep"],
	["", "shrinkstrategy=STRATEGY", "shrink strategy", "shrink-pad"],
	["", "stretchstrategy=STRATEGY", "stretch strategy", "pad"],
	["", "mixedstrategy=STRATEGY", "mixed strategy", "shrink-pad"]
]).bindHelp().parseSystem().options;

jsffmpeg.ffmpeg_graceful(args.source, {
	width: parseInt(args.width) || 640,
	height: parseInt(args.height) || 360,
	video_format: "avi"
}, args.target, null, null, {
	test_ffmpeg: true,
	timeout: args.timeout
}).success(function(data) {
	console.log(data);
}).error(function(error) {
	console.log(error);
});