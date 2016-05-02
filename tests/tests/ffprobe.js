var ffmpeg = require(__dirname + "/../../index.js");

var ROTATED_MOV_VIDEO = "tests/assets/iphone_rotated.mov";

test("ffprobe rotated mov", function() {
	stop();
	ffmpeg.ffprobe(ROTATED_MOV_VIDEO).callback(function (error, value) {
		QUnit.deepEqual(value.format.nb_streams, 2);
		start();
	});
});