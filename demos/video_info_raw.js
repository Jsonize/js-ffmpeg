var jsffmpeg = require(__dirname + "/../index.js");

var args = require('node-getopt').create([
	["", "source=FILE", "source video"]	,
    ["", "docker=CONTAINER", "docker"]
]).bindHelp().parseSystem().options;

jsffmpeg.ffprobe(args.source, {
    docker: args.docker
}).success(function (data) {
    console.log(data);
}).error(function (error) {
    console.log(error);
});