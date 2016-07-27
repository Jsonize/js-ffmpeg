var ffmpeg = require(__dirname + "/../../index.js");

var TEMP_MP4_VIDEO = "temp/output-test-watermark.mp4";
var STANDARD_MP4 = "tests/assets/video-640-360.mp4";
var WATERMARK_FILE = "tests/assets/logo.png";

test("ffmpeg-simple with logo", function() {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		watermark: WATERMARK_FILE
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		start();
	});
});
