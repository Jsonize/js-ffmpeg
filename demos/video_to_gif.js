var jsffmpeg = require(__dirname + "/../index.js");

var args = require('node-getopt').create([
	["", "source=FILE", "source video"],
	["", "target=FILE", "target image"],
	["", "docker=CONTAINER", "docker"]
]).bindHelp().parseSystem().options;

jsffmpeg.ffmpeg_simple(args.source, {
	output_type: "gif",
	framerate: 12,
	width: 480,
	time_start: 0,
	time_end: 2
}, args.target, null, null, {
	docker: args.docker,
	test_ffmpeg: true
}).success(function (data) {
	console.log(data);
}).error(function (error) {
	console.log(error);
});
