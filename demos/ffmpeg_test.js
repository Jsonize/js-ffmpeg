var jsffmpeg = require(__dirname + "/../index.js");

var args = require('node-getopt').create([
    ["", "docker=CONTAINER", "docker"]
]).bindHelp().parseSystem().options;

jsffmpeg.ffmpeg_test({
    docker: args.docker
}).success(function (data) {
    console.log(data);
}).error(function (error) {
    console.log(error);
});