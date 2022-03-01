var jsffmpeg = require(__dirname + "/../index.js");

var args = require('node-getopt').create([
	["", "source=FILE", "source video"],
	["", "target=FILE", "target video"]
]).bindHelp().parseSystem().options;

jsffmpeg.ffmpeg_faststart(args.source, args.target, null, null, {
    /*
    docker: {
        "container" : "jrottenberg/ffmpeg",
        "proxy": "localhost:1234",
        "replaceArguments": {
            "libfaac": "libfdk_aac",
            "^/var": "/private/var"
        },
        "preprocessFiles": {
            "chown": "USERNAME",
            "chmod": 666,
            "mkdirs": true
        },
        "postprocessFiles": {
            "chown": "daemon",
            "chmod": 666,
            "recoverChown": true,
            "recoverChmod": true
        }
    },
    "test_info" : {
        "capabilities" : {
            "auto_rotate" : true
        },
        "encoders" : ["libdfk_aac", "aac"]
    },
    */
    test_ffmpeg: true,
	timeout: args.timeout
}).success(function (data) {
	console.log(data);
}).error(function (error) {
	console.log(error);
});