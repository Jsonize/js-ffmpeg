var ffmpeg = require(__dirname + "/../../index.js");
var settings = require(__dirname + "/settings.js");

var STANDARD_MP4 = __dirname + "/../assets/video-640-360.mp4";
var TEMP_MP4_VIDEO = __dirname + "/../../temp/output-test.mp4";

QUnit.test("ffmpeg-simple shrink same fixed ratio", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 320,
		height: 180,
		ratio_strategy: "fixed"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 320);
		assert.equal(value.video.height, 180);
		done();
	});
});

QUnit.test("ffmpeg-simple stretch same fixed ratio", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 960,
		height: 540,
		ratio_strategy: "fixed",
		stretch_strategy: "stretch-crop"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 960);
		assert.equal(value.video.height, 540);
		done();
	});
});

QUnit.test("ffmpeg-simple shrink smaller ratio, shrink ratio", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 320,
		height: 200,
		ratio_strategy: "shrink"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 320);
		assert.equal(value.video.height, 180);
		done();
	});
});

QUnit.test("ffmpeg-simple shrink greater ratio, shrink ratio", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 400,
		height: 180,
		ratio_strategy: "shrink"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 320);
		assert.equal(value.video.height, 180);
		done();
	});
});



QUnit.test("ffmpeg-simple shrink smaller ratio, stretch ratio", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 300,
		height: 180,
		ratio_strategy: "stretch"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 320);
		assert.equal(value.video.height, 180);
		done();
	});
});

QUnit.test("ffmpeg-simple shrink greater ratio, stretch ratio", function(assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 320,
		height: 140,
		ratio_strategy: "stretch"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 320);
		assert.equal(value.video.height, 180);
		done();
	});
});

QUnit.test("ffmpeg-simple shrink smaller ratio, fixed ratio, shrink-pad", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 240,
		height: 180,
		ratio_strategy: "fixed",
		shrink_strategy: "shrink-pad"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 240);
		assert.equal(value.video.height, 180);
		done();
	});
});

QUnit.test("ffmpeg-simple shrink greater ratio, fixed ratio, shrink-pad", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 360,
		height: 140,
		ratio_strategy: "fixed",
		shrink_strategy: "shrink-pad"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 360);
		assert.equal(value.video.height, 140);
		done();
	});
});

QUnit.test("ffmpeg-simple shrink smaller ratio, fixed ratio, shrink-crop", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 240,
		height: 180,
		ratio_strategy: "fixed",
		shrink_strategy: "shrink-crop"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 240);
		assert.equal(value.video.height, 180);
		done();
	});
});

QUnit.test("ffmpeg-simple shrink greater ratio, fixed ratio, shrink-crop", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 360,
		height: 140,
		ratio_strategy: "fixed",
		shrink_strategy: "shrink-crop"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 360);
		assert.equal(value.video.height, 140);
		done();
	});
});

QUnit.test("ffmpeg-simple shrink smaller ratio, fixed ratio, crop", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 240,
		height: 180,
		ratio_strategy: "fixed",
		shrink_strategy: "crop"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 240);
		assert.equal(value.video.height, 180);
		done();
	});
});

QUnit.test("ffmpeg-simple shrink greater ratio, fixed ratio, crop", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 360,
		height: 140,
		ratio_strategy: "fixed",
		shrink_strategy: "crop"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 360);
		assert.equal(value.video.height, 140);
		done();
	});
});



QUnit.test("ffmpeg-simple stretch smaller ratio, fixed ratio, stretch-pad", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 960,
		height: 600,
		ratio_strategy: "fixed",
		stretch_strategy: "stretch-pad"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 960);
		assert.equal(value.video.height, 600);
		done();
	});
});



QUnit.test("ffmpeg-simple stretch greater ratio, fixed ratio, stretch-pad", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 960,
		height: 500,
		ratio_strategy: "fixed",
		stretch_strategy: "stretch-pad"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 960);
		assert.equal(value.video.height, 500);
		done();
	});
});

QUnit.test("ffmpeg-simple stretch smaller ratio, fixed ratio, stretch-crop", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 960,
		height: 600,
		ratio_strategy: "fixed",
		stretch_strategy: "stretch-crop"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 960);
		assert.equal(value.video.height, 600);
		done();
	});
});

QUnit.test("ffmpeg-simple stretch greater ratio, fixed ratio, stretch-crop", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 960,
		height: 500,
		ratio_strategy: "fixed",
		stretch_strategy: "stretch-crop"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 960);
		assert.equal(value.video.height, 500);
		done();
	});
});


QUnit.test("ffmpeg-simple stretch smaller ratio, fixed ratio, pad", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 960,
		height: 600,
		ratio_strategy: "fixed",
		stretch_strategy: "pad"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 960);
		assert.equal(value.video.height, 600);
		done();
	});
});

QUnit.test("ffmpeg-simple stretch greater ratio, fixed ratio, pad", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 960,
		height: 500,
		ratio_strategy: "fixed",
		stretch_strategy: "pad"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 960);
		assert.equal(value.video.height, 500);
		done();
	});
});

QUnit.test("ffmpeg-simple mixed smaller ratio, fixed ratio, stretch-crop", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 600,
		height: 400,
		ratio_strategy: "fixed",
		mixed_strategy: "stretch-crop"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 600);
		assert.equal(value.video.height, 400);
		done();
	});
});


QUnit.test("ffmpeg-simple mixed greater ratio, fixed ratio, stretch-crop", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 700,
		height: 300,
		ratio_strategy: "fixed",
		mixed_strategy: "stretch-crop"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 700);
		assert.equal(value.video.height, 300);
		done();
	});
});

QUnit.test("ffmpeg-simple mixed smaller ratio, fixed ratio, shrink-pad", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 600,
		height: 400,
		ratio_strategy: "fixed",
		mixed_strategy: "shrink-pad"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 600);
		assert.equal(value.video.height, 400);
		done();
	});
});

QUnit.test("ffmpeg-simple mixed greater ratio, fixed ratio, shrink-crop", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 700,
		height: 300,
		ratio_strategy: "fixed",
		mixed_strategy: "shrink-pad"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 700);
		assert.equal(value.video.height, 300);
		done();
	});
});


QUnit.test("ffmpeg-simple mixed smaller ratio, fixed ratio, crop-pad", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 600,
		height: 400,
		ratio_strategy: "fixed",
		mixed_strategy: "crop-pad"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 600);
		assert.equal(value.video.height, 400);
		done();
	});
});

QUnit.test("ffmpeg-simple mixed greater ratio, fixed ratio, crop-pad", function (assert) {
	var done = assert.async();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 700,
		height: 300,
		ratio_strategy: "fixed",
		mixed_strategy: "crop-pad"
	}, TEMP_MP4_VIDEO, null, null, settings).callback(function (error, value) {
		assert.ok(!error);
		assert.equal(value.video.width, 700);
		assert.equal(value.video.height, 300);
		done();
	});
});


