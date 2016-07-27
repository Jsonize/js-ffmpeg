var ffmpeg = require(__dirname + "/../../index.js");

var STANDARD_MP4 = "tests/assets/video-640-360.mp4";
var TEMP_MP4_VIDEO = "temp/output-test-volume.mp4";

test("ffmpeg volume detect", function() {
	stop();
	ffmpeg.ffmpeg_volume_detect(STANDARD_MP4).callback(function (error, value) {
		QUnit.equal(value.mean_volume, -36.5);
		QUnit.equal(value.max_volume, -25.8);
		ok(!error);
		start();
	});
});


test("ffmpeg volume normalization", function() {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		normalize_audio: true
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		start();
	});
});
