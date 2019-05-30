var jsffmpeg = require(__dirname + "/../index.js");

var args = require('node-getopt').create([
	["", "source=FILE", "source video"],
	["", "target=FILE", "target video"],
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
	width: 640,
	height: 360,
	watermark: args.watermark,
	//normalize_audio: true
	ratio_strategy: args.ratiostrategy,
	size_strategy: args.sizestrategy,
	shrink_strategy: args.shrinkstrategy,
	stretch_strategy: args.stretchstrategy,
	mixed_strategy: args.mixedstrategy
}, args.target, null, null, {
    test_ffmpeg: true,
	timeout: args.timeout
	/*docker: {
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
	}*/
}).success(function (data) {
	console.log(data);
}).error(function (error) {
	console.log(error);
});