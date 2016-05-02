var ffmpeg = require(__dirname + "/../../index.js");

var NOT_EXISTING_VIDEO = "./notexisting.mp4";
var ROTATED_MOV_VIDEO = "tests/assets/iphone_rotated.mov";

test("ffprobe-simple not existing", function() {
	stop();
	ffmpeg.ffprobe_simple(NOT_EXISTING_VIDEO).callback(function (error, value) {
		QUnit.equal(error, 'File does not exist');
		start();
	});
});

test("ffprobe-simple rotated mov", function() {
	stop();
	ffmpeg.ffprobe_simple(ROTATED_MOV_VIDEO).callback(function (error, value) {
		QUnit.deepEqual(value, {
			filename : ROTATED_MOV_VIDEO,
			stream_count : 2,
			size : 159993,
			bit_rate : 581352,
			start_time : 0,
			duration : 2.201667,
			format_name : 'QuickTime / MOV',
			format_extensions : [ 'mov', 'mp4',
					'm4a', '3gp', '3g2', 'mj2' ],
			format_default_extension : 'mov',
			audio : {
				index : 0,
				codec_name : 'aac',
				codec_long_name : 'AAC (Advanced Audio Coding)',
				codec_profile : 'LC',
				audio_channels : 1,
				sample_rate : 44100,
				bit_rate : 61893
			},
			video : {
				index : 1,
				rotation : 90,
				width : 568,
				height : 320,
				codec_name : 'avc1',
				codec_long_name : 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10',
				codec_profile : 'Baseline',
				bit_rate : 507677
			}
		});
		start();
	});
});