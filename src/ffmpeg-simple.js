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
					output_type: "video", // video, audio, image
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
					video_format: "mp4",
					
					width: null,
					height: null,
					auto_rotate: true,
					ratio_master: "target", // source, target
					ratio_correction: "pad", // pad, crop
					size_correction: "stretch" // pad, crop, stretch
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
				
				
				if (options.output_type !== 'audio') {
					var source = infos[0];
					var sourceWidth = source.rotated_width;
					var sourceHeight = source.rotated_height;
					var sourceRatio = sourceWidth / sourceHeight;
					var targetWidth = sourceWidth;
					var targetHeight = sourceHeight;
					var targetRatio = sourceRatio;
					var ratioSourceTarget = 0;
					
					/*
					 * 
					 * Which sizing should be used?
					 * 
					 */
					
					// Step 1: Fix Rotation
					if (options.auto_rotate && source.rotation !== 0) {
						if (source.rotation % 180 === 90) {
							args.push("-vf");
							args.push("transpose=" + (source.rotation === 90 ? 1 : 2));
						}
						if (source.rotation >= 180) {
							args.push("-vf");
							args.push("hflip,vflip");
						}
						args.push("-metadata:s:v:0");
						args.push("rotate=0");
					} 
					if (options.width && options.height) {
						
						// Step 2: Fix Size
						targetWidth = options.width;
						targetHeight = options.height;
						targetRatio = targetWidth / targetHeight;
						ratioSourceTarget = Math.sign(sourceWidth * targetHeight - targetWidth * sourceHeight);
						if (sourceWidth < targetWidth && sourceHeight < targetHeight && options.size_correction === "crop") {
							targetWidth = ratioSourceTarget >= 0 ? sourceWidth : Math.round(sourceHeight * targetRatio);
							targetHeight = ratioSourceTarget <= 0 ? sourceHeight : Math.round(sourceWidth / targetRatio);
						}
						
						// Step 3: Fix Ratio
						if (ratioSourceTarget !== 0 && options.ratio_master === "source") {
							var factor = options.ratio_correction === "pad" ? 1 : -1;
							targetWidth = ratioSourceTarget * factor < 0 ? targetWidth : Math.round(targetHeight * sourceRatio);
							targetHeight = ratioSourceTarget * factor > 0 ? targetHeight : Math.round(targetWidth / sourceRatio);
							targetRatio = sourceRatio;
							ratioSourceTarget = 0;
						}
						
						// Step 4: Modulus
						var modulus = options.output_type === 'video' ? helpers.videoFormats[options.video_format].modulus || 1 : 1;
						targetWidth = targetWidth % modulus === 0 ? targetWidth : (Math.round(targetWidth / modulus) * modulus);
						targetHeight = targetHeight % modulus === 0 ? targetHeight : (Math.round(targetHeight / modulus) * modulus);
						args.push("-s");
						args.push(targetWidth + "x" + targetHeight);
					
						// Step 5: Crop / Pad
						var croppad = 0;
						if (ratioSourceTarget === 0 && options.size_correction === "pad" && targetWidth > sourceWidth && targetHeight > sourceHeight)
							croppad = -1;
						else if (ratioSourceTarget !== 0 && options.ratio_correction === "pad")
							croppad = -1;
						else if (ratioSourceTarget !== 0 && options.ratio_correction === "crop")
							croppad = 1;
						if (croppad) {
							var croppadWidth = (croppad * ratioSourceTarget >= 0) ? sourceWidth : Math.round(sourceHeight * targetRatio);
							var croppadHeight = (croppad * ratioSourceTarget <= 0) ? sourceHeight : Math.round(sourceWidth / targetRatio);
							var croppadX = Math.round((sourceWidth - croppadWidth) / 2);
							var croppadY = Math.round((sourceHeight - croppadHeight) / 2);
							args.push("-vf");
							args.push((croppad === -1 ? 'pad' : 'crop') + "=" + [croppadWidth, croppadHeight, croppad * croppadX, croppad * croppadY].join(":"));
						}
					}
					
				
				
					/*
					 * 
					 * Watermark (depends on sizing)
					 * 
					 */
					
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
				// TODO
				// '-b:v' '211k'
				// '-b:a' '64k'
				
				
				return ffmpeg_multi_pass.ffmpeg_multi_pass(files, args, passes, output, function (progress) {
					if (eventCallback)
						eventCallback.call(eventContext || this, helper.parseProgress(progress, duration));
				}, this).mapSuccess(function () {
					return ffprobe_simple.ffprobe_simple(output);
				}, this);
			});
			
			
		}
			
	};	
	
});

