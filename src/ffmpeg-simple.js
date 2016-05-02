Scoped.require([
    "betajs:Promise",
    "betajs:Types",
    "betajs:Objs"
], function (Promise, Types, Objs) {
	
	var ffmpeg_multi_pass = require(__dirname + "/ffmpeg-multi-pass.js");
	var ffprobe_simple = require(__dirname + "/ffprobe-simple.js");
	var helpers = require(__dirname + "/ffmpeg-helpers.js");
	
	
	module.exports = {
			 
		ffmpeg_simple: function (files, options, output, eventCallback, eventContext) {
			if (Types.is_string(files))
				files = [files];
			
			return Promise.and(files.map(function (file) {
				return ffprobe_simple.ffprobe_simple(file);
			})).mapSuccess(function (infos) {
				options = Objs.extend({
					output_type: "video", // audio, image
					synchronize: true,
					framerate: 25, // null
					framerate_gop: 250,
					image_percentage: null,
					image_position: null,
					time_limit: null,
					time_start: 0,
					time_end: null,
					video_map: null, //0,1,2,...
					audio_map: null, //0,1,2
					video_profile: "baseline",
					faststart: true,
					video_format: "mp4"
				}, options);
				
				var passes = 1;
				
				var args = [];

				
				/*
				 * 
				 * Synchronize Audio & Video 
				 * 
				 */
				if (options.output_type === 'video')
					if (options.synchronize)
						args.push(helpers.paramsSynchronize);
				
				
				/*
				 * 
				 * Map Streams
				 * 
				 */
				if (options.output_type === 'audio') {
					args.push(helpers.paramsAudioOnly);
				} else if (options.output_type === 'video') {
					if (options.video_map !== null)
						args.push(helpers.paramsVideoMap(options.video_map));
					if (options.audio_map !== null)
						args.push(helpers.paramsAudioMap(options.audio_map));
				}
				
				
				/*
				 * 
				 * Which time region should be used?
				 * 
				 */
				var duration = helpers.computeDuration(infos[0].duration, options.time_start, options.time_end, options.time_limit);
				if (options.output_type === 'image')
					args.push(helpers.paramsImageExtraction(options.image_position, options.image_percentage, duration));
				else if (options.time_start || options.time_end || options.time_limit)
					args.push(helpers.paramsTimeDuration(options.time_start, options.time_end, options.time_limit));
				
				
				/*
				 * 
				 * Which sizing should be used?
				 * 
				 */
				if (options.output_type !== 'audio') {
					// TODO: Rotation, Resize, Pad, Crop
					
					// '-vf' 'transpose=1' '-metadata:s:v:0' 'rotate=0'
					// '-vf' 'transpose=1' '-metadata:s:v:0' 'rotate=0' '-s' '270x480'
				}
				
				
				/*
				 * 
				 * Watermark (depends on sizing)
				 * 
				 */
				if (options.output_type !== 'audio') {
					// TODO: Watermark
				}
				
				
				/*
				 * 
				 * Format
				 * 
				 */
				if (options.output_type === 'image')
					args.push(helpers.paramsFormatImage);
				if (options.output_type === 'video') {
					if (options.video_profile && format === "mp4")
						args.push(helpers.paramsVideoProfile(options.video_profile));
					if (options.faststart && format === "mp4")
						args.push(helpers.paramsFastStart);
					var format = helpers.videoFormats[options.video_format];
					if (format && (format.fmt || format.vcodec || format.acodec || format.params))						
						args.push(helpers.paramsVideoFormat(format.fmt, format.vcodec, format.acodec, format.params));
					if (options.framerate)
						args.push(helpers.paramsFramerate(options.framerate, format.bframes, options.framerate_gop));
					args.push(helpers.paramsVideoCodecUniversalConfig());
					if (format && format.passes > 1)
						passes = format.passes;
				}
				
				
				/*
				 * 
				 * Bit rate (depends on watermark + sizing)
				 * 
				 */
				// '-b:v' '211k'
				// '-b:a' '64k'
				
				
				return ffmpeg_multi_pass.ffmpeg_multi_pass(files, args, passes, output, function (progress) {
					if (eventCallback)
						eventCallback.call(eventContext || this, helper.parseProgress(progress, duration));
				}, this);
			});
			
			
		}
			
	};	
	
});

