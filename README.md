# js-ffmpeg

This is a simple wrapper for FFMPEG and FFPROBE.


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
	
	// raw call of ffmpeg (source(s), arguments, target, progress callback)
	ffmpeg.ffmpeg('video.mp4', [...], 'output.mp4', function (progress) {
		console.log(progress);
	}).success(function (json) {
		console.log(json);
	}).error(function (error) {
		console.log(error);
	});
	
	// improved and simplified call of ffmpeg (source(s), arguments, target, progress callback)
	ffmpeg.ffmpeg_simple('video.mp4', {
		width: 640,
		height: 360,
		auto_rotate: true,
		ratio_strategy: "fixed",
		shrink_strategy: "crop",
		mixed_strategy: "crop-pad",
		stretch_strategy: "pad"
	}, 'output.mp4', function (progress) {
		console.log(progress);
	}).success(function (json) {
		console.log(json);
	}).error(function (error) {
		console.log(error);
	});
```


## Contributors

- Ziggeo
- Oliver Friedmann


## License

Apache-2.0

