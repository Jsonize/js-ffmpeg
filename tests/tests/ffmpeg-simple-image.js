var ffmpeg = require(__dirname + "/../../index.js");
var settings = require(__dirname + "/settings.js");

var TEMP_IMAGE = __dirname + "/../../temp/output-test-watermark.png";
var WATERMARK_FILE = __dirname + "/../assets/logo.png";

QUnit.test("ffmpeg-simple with logo", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(WATERMARK_FILE, {
		output_type: "image"
	}, TEMP_IMAGE, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		done();
	});
});
