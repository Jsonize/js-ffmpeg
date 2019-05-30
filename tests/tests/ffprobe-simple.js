var ffmpeg = require(__dirname + "/../../index.js");
var settings = require(__dirname + "/settings.js");

var NOT_EXISTING_VIDEO = __dirname + "/notexisting.mp4";
var ROTATED_MOV_VIDEO = __dirname + "/../assets/iphone_rotated.mov";
var NO_VIDEO = __dirname + "/../assets/novideo.mp4";
var EXPLOIT_FILE = __dirname + "/../assets/etx_passwd_xbin.avi";

QUnit.test("ffprobe-simple not existing", function(assert) {
	var done = assert.async();
	ffmpeg.ffprobe_simple(NOT_EXISTING_VIDEO, settings).callback(function(error, value) {
		assert.equal(error, 'File does not exist');
		done();
	});
});

QUnit.test("ffprobe-simple no video", function(assert) {
	var done = assert.async();
	ffmpeg.ffprobe_simple(NO_VIDEO, settings).callback(function(error, value) {
		assert.equal(error, 'Cannot read file');
		done();
	});
});

QUnit.test("ffprobe-simple rotated mov", function(assert) {
	var done = assert.async();
	ffmpeg.ffprobe_simple(ROTATED_MOV_VIDEO, settings).callback(function(error, value) {
		delete value.filename;
		delete value.format_name;
		delete value.audio.codec_long_name;
        delete value.audio.codec_profile;
        delete value.video.codec_long_name;
        delete value.video.codec_profile;
		assert.deepEqual(value, {
			//filename : ROTATED_MOV_VIDEO,
			stream_count : 2,
			size : 159993,
			bit_rate : 581352,
			start_time : 0,
			duration : 2.201667,
			//format_name : 'QuickTime / MOV',
			format_extensions : [ 'mov', 'mp4', 'm4a', '3gp', '3g2', 'mj2' ],
			format_default_extension : 'mov',
			audio : {
				index : 0,
				codec_name : 'aac',
				//codec_long_name : 'AAC (Advanced Audio Coding)',
				//codec_profile : 'LC',
				audio_channels : 1,
				sample_rate : 44100,
				bit_rate : 61893
			},
			video : {
				index : 1,
				rotation : 90,
				width : 568,
				height : 320,
				rotated_width : 320,
				rotated_height : 568,
				codec_name : 'avc1',
				//codec_long_name : 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10',
				//codec_profile : 'Baseline',
				bit_rate : 507677,
				frames: 66
			}
		});
		done();
	});
});

QUnit.test("ffprobe-simple exploit", function (assert) {
	var done = assert.async();
	ffmpeg.ffprobe_simple(EXPLOIT_FILE, settings).callback(function (error, value) {
		assert.ok(error);
		done();
	});
});