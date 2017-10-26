var jsffmpeg = require(__dirname + "/../index.js");

var args = require('node-getopt').create([
	["", "source=FILE", "source video"],
	["", "target=FILE", "target video"],
    ["", "docker=CONTAINER", "docker"]
]).bindHelp().parseSystem().options;

jsffmpeg.ffmpeg_simple(args.source, {
	width: 1280,
	height: 720,
	ratio_strategy: "stretch",
	size_strategy: "keep",
	shrink_strategy: "shrink-pad",
	stretch_strategy: "stretch-pad",
	mixed_strategy: "shrink-pad"
}, args.target, null, null, {
    docker: args.docker,
    test_ffmpeg: true
}).success(function (data) {
    console.log(data);
}).error(function (error) {
    console.log(error);
});