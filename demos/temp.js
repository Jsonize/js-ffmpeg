var jsffmpeg = require(__dirname + "/../index.js");

var args = require('node-getopt').create([
	["", "source=FILE", "source video"],
	["", "target=FILE", "target video"]
]).bindHelp().parseSystem().options;

jsffmpeg.ffmpeg_simple(args.source, {
	width: 1280,
	height: 720,
	ratio_strategy: "stretch",
	size_strategy: "keep",
	shrink_strategy: "shrink-pad",
	stretch_strategy: "stretch-pad",
	mixed_strategy: "shrink-pad"
}, args.target).success(function (data) {
	console.log(data);
});
