var jsffmpeg = require(__dirname + "/../index.js");

var args = require('node-getopt').create([
	["", "source=FILE", "source video"],
	["", "target=FILE", "target video"],
	["", "docker=CONTAINER", "docker"]
]).bindHelp().parseSystem().options;

jsffmpeg.ffmpeg_simple(args.source, {
	width: 640,
	height: 480,
	normalize_audio: true
}, args.target, null, null, {
	docker: options.docker,
	test_ffmpeg: true
}).success(function (data) {
	console.log(data);
}).error(function (error) {
	console.log(error);
});