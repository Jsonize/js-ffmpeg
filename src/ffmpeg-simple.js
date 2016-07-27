Scoped.require([
    "betajs:Promise",
    "betajs:Types",
    "betajs:Objs"
], function (Promise, Types, Objs) {
	
	var ffmpeg_multi_pass = require(__dirname + "/ffmpeg-multi-pass.js");
	var ffprobe_simple = require(__dirname + "/ffprobe-simple.js");
	var ffmpeg_volume_detect = require(__dirname + "/ffmpeg-volume-detect.js");
	var helpers = require(__dirname + "/ffmpeg-helpers.js");
	
	
	module.exports = {
			 
		ffmpeg_simple: function (files, options, output, eventCallback, eventContext) {
			if (Types.is_string(files))
				files = [files];
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
				
				audio_bit_rate: null,
				video_bit_rate: null,
				
				normalize_audio: false,
				width: null,
				height: null,
				auto_rotate: true,
				
				ratio_strategy: "fixed", // "shrink", "stretch"
				shrink_strategy: "shrink-pad", // "crop", "shrink-crop"
				stretch_strategy: "pad", // "stretch-pad", "stretch-crop"
				mixed_strategy: "shrink-pad", // "stretch-crop", "crop-pad"
				
				watermark: null,
				watermark_size: 0.25,
				watermark_x: 0.95,
				watermark_y: 0.95
			}, options);
			
			var promises = files.map(function (file) {
				return ffprobe_simple.ffprobe_simple(file);
			});
			
			if (options.normalize_audio)
				promises.push(ffmpeg_volume_detect.ffmpeg_volume_detect(files[options.audio_map || 0]));
			if (options.watermark)
				promises.push(ffprobe_simple.ffprobe_simple(options.watermark));
			
			return Promise.and(promises).mapSuccess(function (infos) {
				
				var watermarkInfo = null;
				if (options.watermark)
					watermarkInfo = infos.pop();
				
				var audioNormalizationInfo = null;
				if (options.normalize_audio)
					audioNormalizationInfo = infos.pop();
				
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
				 * Audio Normalization?
				 * 
				 */
				if (audioNormalizationInfo) {
					args.push("-af");
					args.push("volume=" + (-audioNormalizationInfo.max_volume) + "dB");
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
				
				
				var videoInfo = infos[0].video;
				var audioInfo = infos[1] ? infos[1].audio || infos[0].audio : infos[0].audio;
				
				
				var sourceWidth = 0;
				var sourceHeight = 0;
				var targetWidth = 0;
				var targetHeight = 0;
//try {
				
				if (options.output_type !== 'audio') {
					var source = infos[0];
					sourceWidth = source.video.rotated_width;
					sourceHeight = source.video.rotated_height;
					var sourceRatio = sourceWidth / sourceHeight;
					targetWidth = sourceWidth;
					targetHeight = sourceHeight;
					var targetRatio = sourceRatio;
					var ratioSourceTarget = 0;
					
					/*
					 * 
					 * Which sizing should be used?
					 * 
					 */

					// Step 1: Fix Rotation
					if (options.auto_rotate && source.video.rotation) {
						if (source.video.rotation % 180 === 90) {
							args.push("-vf");
							args.push("transpose=" + (source.video.rotation === 90 ? 1 : 2));
						}
						if (source.video.otation >= 180) {
							args.push("-vf");
							args.push("hflip,vflip");
						}
						args.push("-metadata:s:v:0");
						args.push("rotate=0");
					} 
					if (options.width && options.height) {
						
						// Step 2: Fix Size & Ratio
						targetWidth = options.width;
						targetHeight = options.height;
						targetRatio = targetWidth / targetHeight;
						ratioSourceTarget = Math.sign(sourceWidth * targetHeight - targetWidth * sourceHeight);
						
						if (options.ratio_strategy !== "fixed" && ratioSourceTarget !== 0) {
							if ((options.ratio_strategy === "stretch" && ratioSourceTarget > 0) || (options.ratio_strategy === "shrink" && ratioSourceTarget < 0))
								targetWidth = targetHeight * sourceRatio;
							if ((options.ratio_strategy === "stretch" && ratioSourceTarget < 0) || (options.ratio_strategy === "shrink" && ratioSourceTarget > 0))
								targetHeight = targetWidth / sourceRatio;
							targetRatio = sourceRatio;
							ratioSourceTarget = 0;
						}
						
						var vf = [];
						
						// Step 3: Modulus
						var modulus = options.output_type === 'video' ? helpers.videoFormats[options.video_format].modulus || 1 : 1;
						targetWidth = targetWidth % modulus === 0 ? targetWidth : (Math.round(targetWidth / modulus) * modulus);
						targetHeight = targetHeight % modulus === 0 ? targetHeight : (Math.round(targetHeight / modulus) * modulus);

						var cropped = false;
						var addCrop = function (x, y, multi) {
							x = Math.round(x);
							y = Math.round(y);
							if (x === 0 && y === 0)
								return;
							cropped = true;
							var cropWidth = targetWidth - 2 * x;
							var cropHeight = targetHeight - 2 * y;
							args.push("-vf");
							args.push("scale=" + [multi || ratioSourceTarget >= 0 ? cropWidth : targetWidth, !multi && ratioSourceTarget >= 0 ? targetHeight : cropHeight].join(":") + "," +
									  "crop=" + [!multi && ratioSourceTarget <= 0 ? cropWidth : targetWidth, multi || ratioSourceTarget <= 0 ? targetHeight : cropHeight, -x, -y].join(":"));
						};
						var padded = false;
						var addPad = function (x, y, multi) {
							x = Math.round(x);
							y = Math.round(y);
							if (x === 0 && y === 0)
								return;
							padded = true;
							var padWidth = targetWidth - 2 * x;
							var padHeight = targetHeight - 2 * y;
							args.push("-vf");
							args.push("scale=" + [multi || ratioSourceTarget <= 0 ? padWidth : targetWidth, !multi && ratioSourceTarget <= 0 ? targetHeight : padHeight].join(":") + "," +
									  "pad=" + [!multi && ratioSourceTarget >= 0 ? padWidth : targetWidth, multi || ratioSourceTarget >= 0 ? targetHeight : padHeight, x, y].join(":"));
						};
						
						// Step 4: Crop & Pad
						if (targetWidth >= sourceWidth && targetHeight >= sourceHeight) {
							if (options.stretch_strategy === "pad")
								addPad((targetWidth - sourceWidth) / 2,
									   (targetHeight - sourceHeight) / 2,
									   true);
							else if (options.stretch_strategy === "stretch-pad")
								addPad(ratioSourceTarget <= 0 ? (targetWidth - targetHeight * sourceRatio) / 2 : 0,
									   ratioSourceTarget >= 0 ? (targetHeight - targetWidth / sourceRatio) / 2 : 0);
							else // stretch-crop
								addCrop(ratioSourceTarget >= 0 ? (targetWidth - targetHeight * sourceRatio) / 2 : 0,
										   ratioSourceTarget <= 0 ? (targetHeight - targetWidth / sourceRatio) / 2 : 0);
						} else if (targetWidth <= sourceWidth && targetHeight <= sourceHeight) {
							if (options.shrink_strategy === "crop")
								addCrop((targetWidth - sourceWidth) / 2,
									    (targetHeight - sourceHeight) / 2,
									    true);
							else if (options.shrink_strategy === "shrink-crop")
								addCrop(ratioSourceTarget >= 0 ? (targetWidth - targetHeight * sourceRatio) / 2 : 0,
									   ratioSourceTarget <= 0 ? (targetHeight - targetWidth / sourceRatio) / 2 : 0);
							else // shrink-pad
								addPad(ratioSourceTarget <= 0 ? (targetWidth - targetHeight * sourceRatio) / 2 : 0,
										   ratioSourceTarget >= 0 ? (targetHeight - targetWidth / sourceRatio) / 2 : 0);
						} else {
							if (options.mixed_strategy === "shrink-pad")
								addPad(ratioSourceTarget <= 0 ? (targetWidth - targetHeight * sourceRatio) / 2 : 0,
										   ratioSourceTarget >= 0 ? (targetHeight - targetWidth / sourceRatio) / 2 : 0);
							else if (options.mixed_strategy === "stretch-crop")
								addCrop(ratioSourceTarget >= 0 ? (targetWidth - targetHeight * sourceRatio) / 2 : 0,
										   ratioSourceTarget <= 0 ? (targetHeight - targetWidth / sourceRatio) / 2 : 0);
							else {
								// crop-pad
								cropped = true;
								padded = true;
								var direction = ratioSourceTarget >= 0;
								var dirX = Math.abs(Math.round((sourceWidth - targetWidth) / 2));
								var dirY = Math.abs(Math.round((sourceHeight - targetHeight) / 2));
								args.push("-vf");
								args.push("crop=" + [direction ? targetWidth : sourceWidth, direction ? sourceHeight : targetHeight, direction ? dirX : 0, direction ? 0 : dirY].join(":") + "," +
										  "pad=" + [targetWidth, targetHeight, direction ? 0 : dirX, direction ? dirY : 0].join(":"));
							}
						}
						
						if (!padded && !cropped) {
							args.push("-s");
							args.push(targetWidth + "x" + targetHeight);
						}
					}

				
				
					/*
					 * 
					 * Watermark (depends on sizing)
					 * 
					 */

					if (watermarkInfo) {
						var scaleWidth = watermarkInfo.video.width;
						var scaleHeight = watermarkInfo.video.height;
						var maxWidth = targetWidth * options.watermark_size;
						var maxHeight = targetHeight * options.watermark_size;
						if (scaleWidth > maxWidth || scaleHeight > maxHeight) {
							var watermarkRatio = maxWidth * scaleHeight >= maxHeight * scaleWidth;
							scaleWidth = watermarkRatio ? scaleWidth * maxHeight / scaleHeight : maxWidth;
							scaleHeight = !watermarkRatio ? scaleHeight * maxWidth / scaleWidth : maxHeight;
						}
						var posX = options.watermark_x * (targetWidth - scaleWidth);
						var posY = options.watermark_y * (targetHeight - scaleHeight);
						args.push("-vf");
						args.push("movie=" + watermarkInfo.filename + "," +
								  "scale=" + [Math.round(scaleWidth), Math.round(scaleHeight)].join(":") + "[wm];[in][wm]" +
								  "overlay=" + [Math.round(posX), Math.round(posY)].join(":") + "[out]");
					}

				}
				
				
				/*
				 * 
				 * Format
				 * 
				 */
				if (options.output_type === 'image')
					args.push(helpers.paramsFormatImage);
				if (options.output_type === 'video') {
					if (options.video_profile && options.video_format === "mp4")
						args.push(helpers.paramsVideoProfile(options.video_profile));
					if (options.faststart && options.video_format === "mp4")
						args.push(helpers.paramsFastStart);
					var format = helpers.videoFormats[options.video_format];
					if (format && (format.fmt || format.vcodec || format.acodec || format.params))						
						args.push(helpers.paramsVideoFormat(format.fmt, format.vcodec, format.acodec, format.params));
					if (options.framerate)
						args.push(helpers.paramsFramerate(options.framerate, format.bframes, options.framerate_gop));
					args.push(helpers.paramsVideoCodecUniversalConfig);
					if (format && format.passes > 1)
						passes = format.passes;
				}
				
				
				/*
				 * 
				 * Bit rate (depends on watermark + sizing)
				 * 
				 */
				if (options.output_type === "video") {
					args.push("-b:v");
					var video_bit_rate = options.video_bit_rate || Math.min(videoInfo.bit_rate * targetWidth * targetHeight / sourceWidth / sourceHeight, videoInfo.bit_rate);
					args.push(Math.round(video_bit_rate / 1000) + "k");
					if (audioInfo) {
						args.push("-b:a");
						var audio_bit_rate = options.audio_bit_rate || audioInfo.bit_rate;
						args.push(Math.round(audio_bit_rate / 1000) + "k");
					}
				}

//} catch(e) {console.log(e);}
				
//console.log(files, args, passes, output);
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

