var jsffmpeg = require(__dirname + "/../index.js");

var args = require("node-getopt").create([
	["", "source=FILE", "source video"],
	["", "target=FOLDER", "target folder"],
	["", "renditions=OBJECT", "renditions object"],
	["", "watermark=FILE", "watermark image"],
	["", "docker=CONTAINER", "docker"],
	["", "timeout=MS", "timeout"],
	["", "ratiostrategy=STRATEGY", "ratio strategy", "fixed"],
	["", "sizestrategy=STRATEGY", "size strategy", "keep"],
	["", "shrinkstrategy=STRATEGY", "shrink strategy", "shrink-pad"],
	["", "stretchstrategy=STRATEGY", "stretch strategy", "pad"],
	["", "mixedstrategy=STRATEGY", "mixed strategy", "shrink-pad"]
]).bindHelp().parseSystem().options;
const renditions = args.renditions || [
	{resolution: "640x360", bitrate: 800, audio_rate: 96},
	{resolution: "842x480", bitrate: 1400, audio_rate: 128},
	{resolution: "1280x720", bitrate: 2800, audio_rate: 128}
];
jsffmpeg.ffmpeg_playlist(args.source, {
	watermark: args.watermark,
	renditions: renditions,
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
}).success(function(data) {
	console.log(data);
}).error(function(error) {
	console.log(error);
});