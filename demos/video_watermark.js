var jsffmpeg = require(__dirname + "/../index.js");

var args = require('node-getopt').create([
	["", "source=FILE", "source video"],
	["", "target=FILE", "target video"],
    ["", "watermark=FILE", "watermark image"],
    ["", "timeout=MS", "timeout"],
	["", "watermarksize=SIZE", "watermarksize"],
    ["", "watermarkx=WATERMARKX", "watermarkx"],
    ["", "watermarky=WATERMARKY", "watermarky"]
]).bindHelp().parseSystem().options;

jsffmpeg.ffmpeg_graceful(args.source, {
	watermark: args.watermark,
	watermark_size: parseFloat(args.watermarksize),
	watermark_x: parseFloat(args.watermarkx),
	watermark_y: parseFloat(args.watermarky)
}, args.target, null, null, {
    test_ffmpeg: true,
	timeout: args.timeout
}).success(function (data) {
	console.log(data);
}).error(function (error) {
	console.log(error);
});