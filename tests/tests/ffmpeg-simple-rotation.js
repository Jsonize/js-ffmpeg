var ffmpeg = require(__dirname + "/../../index.js");
var settings = require(__dirname + "/settings.js");

var ROTATED_MOV_VIDEO = __dirname + "/../assets/iphone_rotated.mov";
var TEMP_MP4_VIDEO = __dirname + "/../../temp/output-test.mp4";
var STANDARD_MP4 = __dirname + "/../assets/video-640-360.mp4";


QUnit.test("ffmpeg-simple mov to mp4", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(ROTATED_MOV_VIDEO, {}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.rotation, 0);
        assert.equal(value.video.width, 320);
        assert.equal(value.video.height, 568);
		done();
	});
});

QUnit.test("ffmpeg-simple mov to mp4 2", function(assert) {
    var done = assert.async();
    ffmpeg.ffmpeg_simple(ROTATED_MOV_VIDEO, {rotate: 90}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
        assert.ok(!error);
        assert.equal(value.video.rotation, 0);
        assert.equal(value.video.width, 568);
        assert.equal(value.video.height, 320);
        done();
    });
});

QUnit.test("ffmpeg-simple mp4 to mp4", function(assert) {
    var done = assert.async();
    ffmpeg.ffmpeg_simple(STANDARD_MP4, {}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
        assert.ok(!error);
        assert.equal(value.video.rotation, 0);
        assert.equal(value.video.width, 640);
        assert.equal(value.video.height, 360);
        done();
    });
});

QUnit.test("ffmpeg-simple mp4 to mp4 2", function(assert) {
    var done = assert.async();
    ffmpeg.ffmpeg_simple(STANDARD_MP4, {rotate: 90}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
        assert.ok(!error);
        assert.equal(value.video.rotation, 0);
        assert.equal(value.video.width, 360);
        assert.equal(value.video.height, 640);
        done();
    });
});
