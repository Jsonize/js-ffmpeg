var ffmpeg = require(__dirname + "/../../index.js");
var settings = require(__dirname + "/settings.js");

var STANDARD_MP4 = __dirname + "/../assets/video-640-360.mp4";
var TEMP_MP4_VIDEO = __dirname + "/../../temp/output-test-watermark.mp4";
var WATERMARK_FILE = __dirname + "/../assets/logo.png";

QUnit.test("ffmpeg-simple with logo", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		watermark: WATERMARK_FILE
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		done();
	});
});
