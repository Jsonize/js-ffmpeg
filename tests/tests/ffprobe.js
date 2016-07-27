var ffmpeg = require(__dirname + "/../../index.js");

var ROTATED_MOV_VIDEO = "tests/assets/iphone_rotated.mov";
var IMAGE_FILE = "tests/assets/logo.png";

test("ffprobe rotated mov", function() {
	stop();
	ffmpeg.ffprobe(ROTATED_MOV_VIDEO).callback(function (error, value) {
		QUnit.deepEqual(value.format.nb_streams, 2);
		start();
	});
});


test("ffprobe image", function() {
	stop();
	ffmpeg.ffprobe(IMAGE_FILE).callback(function(error, value) {
		QUnit.deepEqual(value.format.nb_streams, 1);
		start();
	});
});