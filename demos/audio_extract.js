var jsffmpeg = require(__dirname + "/../index.js");

var args = require('node-getopt').create([
	["", "source=FILE", "source video"],	
	["", "target=FILE", "target audio"],
    ["", "docker=CONTAINER", "docker"]
]).bindHelp().parseSystem().options;

jsffmpeg.ffmpeg_simple(args.source, {
	output_type: "audio"
}, args.target, null, null, {
    docker: args.docker,
    test_ffmpeg: true
}).success(function (data) {
    console.log(data);
}).error(function (error) {
    console.log(error);
});