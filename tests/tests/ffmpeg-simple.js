var ffmpeg = require(__dirname + "/../../index.js");

var ROTATED_MOV_VIDEO = "tests/assets/iphone_rotated.mov";
var TEMP_MP4_VIDEO = "temp/output.mp4";

/*
test("ffmpeg-simple mov to mp4", function() {
	stop();	
	ffmpeg.ffmpeg_simple(ROTATED_MOV_VIDEO, [], TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		start();
	});
});
*/