var ffmpeg = require(__dirname + "/../../index.js");
var settings = require(__dirname + "/settings.js");

var STANDARD_MP4 = __dirname + "/../assets/video-640-360.mp4";
var TEMP_MP4_VIDEO = __dirname + "/../../temp/output-test-volume.mp4";

QUnit.test("ffmpeg volume detect", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_volume_detect(STANDARD_MP4, settings).callback(function (error, value) {
		assert.equal(value.mean_volume, -36.5);
		assert.equal(value.max_volume, -25.8);
		assert.ok(!error);
		done();
	});
});


QUnit.test("ffmpeg volume normalization", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		normalize_audio: true
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		done();
	});
});
