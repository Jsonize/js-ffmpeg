Scoped = require("betajs-scoped/dist/scoped.js");
BetaJS = require('betajs/dist/beta-noscoped.js');
Scoped.binding("betajs", "global:BetaJS");


module.exports = {
		
	ffprobe: require(__dirname + "/src/ffprobe.js").ffprobe,
	
	ffmpeg: require(__dirname + "/src/ffmpeg.js").ffmpeg,
	
	ffprobe_simple: require(__dirname + "/src/ffprobe-simple.js").ffprobe_simple,
	
	ffmpeg_simple: require(__dirname + "/src/ffmpeg-simple.js").ffmpeg_simple,
	
	ffmpeg_volume_detect: require(__dirname + "/src/ffmpeg-volume-detect.js").ffmpeg_volume_detect
		
};