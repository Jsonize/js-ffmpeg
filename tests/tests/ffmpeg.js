var ffmpeg = require(__dirname + "/../../index.js");
var settings = require(__dirname + "/settings.js");

var ROTATED_MOV_VIDEO = __dirname + "/../assets/iphone_rotated.mov";
var TEMP_MP4_VIDEO = __dirname + "/../../temp/output-test.mp4";
var EXPLOIT_FILE = __dirname + "/../assets/etx_passwd_xbin.avi";


QUnit.test("ffmpeg mov to mp4", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg(ROTATED_MOV_VIDEO, [], TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		done();
	});
});

QUnit.test("ffmpeg timeout", function (assert) {
    var done = assert.async();
    ffmpeg.ffmpeg(ROTATED_MOV_VIDEO, [], TEMP_MP4_VIDEO, null, null, BetaJS.Objs.extend({timeout: 1}, settings)).callback(function (error, value) {
        assert.equal(error.message, "Timeout reached");
        done();
    });
});

QUnit.test("ffmpeg exploit", function (assert) {
    var done = assert.async();
    ffmpeg.ffmpeg(EXPLOIT_FILE, [], TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
        assert.ok(error);
        done();
    });
});