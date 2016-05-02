# js-ffmpeg 0.0.1

This is a simple wrapper for FFMPEG and FFPROBE.

This is very much work in progress.


## Getting Started


```javascript
	git clone https://github.com/jsonize/js-ffmpeg.git
	npm install
	grunt
```



## Basic Usage


```javascript
	ffmpeg = require('js-ffmpeg');
	
	// raw call of ffprobe
	ffmpeg.ffprobe('video.mp4').success(function (json) {
		console.log(json);
	}).error(function (error) {
		console.log(error);
	});
	
	// improved and simplified values and errors
	ffmpeg.ffprobe_simple('video.mp4').success(function (json) {
		console.log(json);
	}).error(function (error) {
		console.log(error);
	});
	
	// raw call of ffprobe (source(s), arguments, target, progress callback)
	ffmpeg.ffmpeg('video.mp4', [...], 'output.mp4', function (progress) {
		console.log(progress);
	}).success(function (json) {
		console.log(json);
	}).error(function (error) {
		console.log(error);
	});
	