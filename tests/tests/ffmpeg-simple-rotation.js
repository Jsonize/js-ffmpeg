var ffmpeg = require(__dirname + "/../../index.js");
var settings = require(__dirname + "/settings.js");

var ROTATED_MOV_VIDEO = __dirname + "/../assets/iphone_rotated.mov";
var TEMP_MP4_VIDEO = __dirname + "/../../temp/output-test.mp4";


QUnit.test("ffmpeg-simple mov to mp4", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(ROTATED_MOV_VIDEO, {}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		done();
	});
});