var ffmpeg = require(__dirname + "/../../index.js");
var settings = require(__dirname + "/settings.js");

var ROTATED_MOV_VIDEO = __dirname + "/../assets/iphone_rotated.mov";
var IMAGE_FILE = __dirname + "/../assets/logo.png";

QUnit.test("ffprobe rotated mov", function (assert) {
	var done = assert.async();
	ffmpeg.ffprobe(ROTATED_MOV_VIDEO, settings).callback(function (error, value) {
		assert.deepEqual(value.format.nb_streams, 2);
		done();
	});
});

QUnit.test("ffprobe image", function (assert) {
    var done = assert.async();
	ffmpeg.ffprobe(IMAGE_FILE, settings).callback(function(error, value) {
        assert.deepEqual(value.format.nb_streams, 1);
        done();
    });
});
