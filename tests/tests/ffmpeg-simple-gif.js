var ffmpeg = require(__dirname + "/../../index.js");
var settings = require(__dirname + "/settings.js");

var TEMP_GIF = __dirname + "/../../temp/output-test.gif";
var VIDEO_FILE = __dirname + "/../assets/video-640-360.mp4";

QUnit.test("ffmpeg-simple gif transcoding", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(VIDEO_FILE, {
		output_type: "gif"
	}, TEMP_GIF, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		done();
	});
});

QUnit.test("ffmpeg-simple gif with 12 fps", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(VIDEO_FILE, {
        output_type: "gif",
        framerate: 12
	}, TEMP_GIF, null, null, settings).callback(function (error, value) {
        assert.ok(!error);
        assert.equal(value.video.frames, 12);
		done();
	});
});

QUnit.test("ffmpeg-simple gif with 320 width", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(VIDEO_FILE, {
        output_type: "gif",
        width: 320
	}, TEMP_GIF, null, null, settings).callback(function (error, value) {
        assert.ok(!error);
        assert.equal(value.video.width, 320);
		done();
	});
});

QUnit.test("ffmpeg-simple gif with 240 height", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(VIDEO_FILE, {
        output_type: "gif",
        height: 240
	}, TEMP_GIF, null, null, settings).callback(function (error, value) {
        assert.ok(!error);
        assert.equal(value.video.height, 240);
		done();
	});
});

QUnit.test("ffmpeg-simple gif with 0.8 second duration", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(VIDEO_FILE, {
        output_type: "gif",
        time_end: 0.8
	}, TEMP_GIF, null, null, settings).callback(function (error, value) {
        assert.ok(!error);
        assert.equal(value.duration, 0.8);
		done();
	});
});

