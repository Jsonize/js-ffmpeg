var ffmpeg = require(__dirname + "/../../index.js");

var TEMP_MP4_VIDEO = "temp/output-test.mp4";
var STANDARD_MP4 = "tests/assets/video-640-360.mp4";


test("ffmpeg-simple shrink same fixed ratio", function() {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 320,
		height: 180,
		ratio_strategy: "fixed"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 320);
		QUnit.equal(value.video.height, 180);
		start();
	});
});

test("ffmpeg-simple stretch same fixed ratio", function() {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 960,
		height: 540,
		ratio_strategy: "fixed",
		stretch_strategy: "stretch-crop"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 960);
		QUnit.equal(value.video.height, 540);
		start();
	});
});

test("ffmpeg-simple shrink smaller ratio, shrink ratio", function() {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 320,
		height: 200,
		ratio_strategy: "shrink"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 320);
		QUnit.equal(value.video.height, 180);
		start();
	});
});

test("ffmpeg-simple shrink greater ratio, shrink ratio", function() {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 400,
		height: 180,
		ratio_strategy: "shrink"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 320);
		QUnit.equal(value.video.height, 180);
		start();
	});
});



test("ffmpeg-simple shrink smaller ratio, stretch ratio", function() {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 300,
		height: 180,
		ratio_strategy: "stretch"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 320);
		QUnit.equal(value.video.height, 180);
		start();
	});
});

test("ffmpeg-simple shrink greater ratio, stretch ratio", function() {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 320,
		height: 140,
		ratio_strategy: "stretch"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 320);
		QUnit.equal(value.video.height, 180);
		start();
	});
});

test("ffmpeg-simple shrink smaller ratio, fixed ratio, shrink-pad", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 240,
		height: 180,
		ratio_strategy: "fixed",
		shrink_strategy: "shrink-pad"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 240);
		QUnit.equal(value.video.height, 180);
		start();
	});
});

test("ffmpeg-simple shrink greater ratio, fixed ratio, shrink-pad", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 360,
		height: 140,
		ratio_strategy: "fixed",
		shrink_strategy: "shrink-pad"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 360);
		QUnit.equal(value.video.height, 140);
		start();
	});
});

test("ffmpeg-simple shrink smaller ratio, fixed ratio, shrink-crop", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 240,
		height: 180,
		ratio_strategy: "fixed",
		shrink_strategy: "shrink-crop"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 240);
		QUnit.equal(value.video.height, 180);
		start();
	});
});

test("ffmpeg-simple shrink greater ratio, fixed ratio, shrink-crop", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 360,
		height: 140,
		ratio_strategy: "fixed",
		shrink_strategy: "shrink-crop"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 360);
		QUnit.equal(value.video.height, 140);
		start();
	});
});

test("ffmpeg-simple shrink smaller ratio, fixed ratio, crop", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 240,
		height: 180,
		ratio_strategy: "fixed",
		shrink_strategy: "crop"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 240);
		QUnit.equal(value.video.height, 180);
		start();
	});
});

test("ffmpeg-simple shrink greater ratio, fixed ratio, crop", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 360,
		height: 140,
		ratio_strategy: "fixed",
		shrink_strategy: "crop"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 360);
		QUnit.equal(value.video.height, 140);
		start();
	});
});



test("ffmpeg-simple stretch smaller ratio, fixed ratio, stretch-pad", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 960,
		height: 600,
		ratio_strategy: "fixed",
		stretch_strategy: "stretch-pad"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 960);
		QUnit.equal(value.video.height, 600);
		start();
	});
});



test("ffmpeg-simple stretch greater ratio, fixed ratio, stretch-pad", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 960,
		height: 500,
		ratio_strategy: "fixed",
		stretch_strategy: "stretch-pad"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 960);
		QUnit.equal(value.video.height, 500);
		start();
	});
});

test("ffmpeg-simple stretch smaller ratio, fixed ratio, stretch-crop", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 960,
		height: 600,
		ratio_strategy: "fixed",
		stretch_strategy: "stretch-crop"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 960);
		QUnit.equal(value.video.height, 600);
		start();
	});
});

test("ffmpeg-simple stretch greater ratio, fixed ratio, stretch-crop", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 960,
		height: 500,
		ratio_strategy: "fixed",
		stretch_strategy: "stretch-crop"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 960);
		QUnit.equal(value.video.height, 500);
		start();
	});
});


test("ffmpeg-simple stretch smaller ratio, fixed ratio, pad", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 960,
		height: 600,
		ratio_strategy: "fixed",
		stretch_strategy: "pad"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 960);
		QUnit.equal(value.video.height, 600);
		start();
	});
});

test("ffmpeg-simple stretch greater ratio, fixed ratio, pad", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 960,
		height: 500,
		ratio_strategy: "fixed",
		stretch_strategy: "pad"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 960);
		QUnit.equal(value.video.height, 500);
		start();
	});
});

test("ffmpeg-simple mixed smaller ratio, fixed ratio, stretch-crop", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 600,
		height: 400,
		ratio_strategy: "fixed",
		mixed_strategy: "stretch-crop"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 600);
		QUnit.equal(value.video.height, 400);
		start();
	});
});


test("ffmpeg-simple mixed greater ratio, fixed ratio, stretch-crop", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 700,
		height: 300,
		ratio_strategy: "fixed",
		mixed_strategy: "stretch-crop"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 700);
		QUnit.equal(value.video.height, 300);
		start();
	});
});

test("ffmpeg-simple mixed smaller ratio, fixed ratio, shrink-pad", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 600,
		height: 400,
		ratio_strategy: "fixed",
		mixed_strategy: "shrink-pad"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 600);
		QUnit.equal(value.video.height, 400);
		start();
	});
});

test("ffmpeg-simple mixed greater ratio, fixed ratio, shrink-crop", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 700,
		height: 300,
		ratio_strategy: "fixed",
		mixed_strategy: "shrink-pad"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 700);
		QUnit.equal(value.video.height, 300);
		start();
	});
});


test("ffmpeg-simple mixed smaller ratio, fixed ratio, crop-pad", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 600,
		height: 400,
		ratio_strategy: "fixed",
		mixed_strategy: "crop-pad"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 600);
		QUnit.equal(value.video.height, 400);
		start();
	});
});

test("ffmpeg-simple mixed greater ratio, fixed ratio, crop-pad", function () {
	stop();
	ffmpeg.ffmpeg_simple(STANDARD_MP4, {
		width: 700,
		height: 300,
		ratio_strategy: "fixed",
		mixed_strategy: "crop-pad"
	}, TEMP_MP4_VIDEO).callback(function (error, value) {
		ok(!error);
		QUnit.equal(value.video.width, 700);
		QUnit.equal(value.video.height, 300);
		start();
	});
});
