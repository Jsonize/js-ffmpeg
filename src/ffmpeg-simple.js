Scoped.require([
    "betajs:Promise",
    "betajs:Types",
    "betajs:Objs"
], function (Promise, Types, Objs) {
	
	var ffmpeg_multi_pass = require(__dirname + "/ffmpeg-multi-pass.js");
    var ffprobe_simple = require(__dirname + "/ffprobe-simple.js");
    var ffmpeg_volume_detect = require(__dirname + "/ffmpeg-volume-detect.js");
    var helpers = require(__dirname + "/ffmpeg-helpers.js");
    var ffmpeg_test = require(__dirname + "/ffmpeg-test.js");
	
	
	module.exports = {

		ffmpeg_simple: function (files, options, output, eventCallback, eventContext, opts) {
			return this.ffmpeg_simple_raw(files, options, output, eventCallback, eventContext, opts).mapError(function (e) {
				if (e.logs) {
					if (e.logs.indexOf("Too many packets buffered for output stream") >= 0 && !options.maxMuxingQueueSize) {
						options.maxMuxingQueueSize = true;
						return this.ffmpeg_simple_raw(files, options, output, eventCallback, eventContext, opts);
					}
				}
 				return e;
			}, this);
		},
			 
		ffmpeg_simple_raw: function (files, options, output, eventCallback, eventContext, opts) {
			opts = opts || {};
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
				remove_audio: false,
				width: null,
				height: null,
				auto_rotate: true,
				rotate: null,
				
				ratio_strategy: "fixed", // "shrink", "stretch"
				size_strategy: "keep", // "shrink", "stretch"
				shrink_strategy: "shrink-pad", // "crop", "shrink-crop"
				stretch_strategy: "pad", // "stretch-pad", "stretch-crop"
				mixed_strategy: "shrink-pad", // "stretch-crop", "crop-pad"
				
				watermark: null,
				watermark_size: 0.25,
				watermark_x: 0.95,
				watermark_y: 0.95,

				watermarks: [],

				maxMuxingQueueSize: false
			}, options);

			var promises = files.map(function (file) {
				return ffprobe_simple.ffprobe_simple(file, opts);
			});

			if (options.watermark) {
				options.watermarks.unshift({
					watermark: options.watermark,
					watermark_size: options.watermark_size,
					watermark_x: options.watermark_x,
					watermark_y: options.watermark_y
				});
			}
			
			if (options.normalize_audio)
				promises.push(ffmpeg_volume_detect.ffmpeg_volume_detect(files[options.audio_map || files.length - 1], opts));
			options.watermarks.forEach(function (wm) {
				promises.push(ffprobe_simple.ffprobe_simple(wm.watermark, opts));
			}, this);
			if (opts.test_ffmpeg)
				promises.push(ffmpeg_test.ffmpeg_test(opts));

			return Promise.and(promises).mapSuccess(function (infos) {

				var testInfo = opts.test_info || {};
				if (opts.test_ffmpeg)
					testInfo = infos.pop();
				
				var watermarkInfos = [];
				options.watermarks.forEach(function () {
					watermarkInfos.unshift(infos.pop());
				});

				var audioNormalizationInfo = null;
				if (options.normalize_audio)
					audioNormalizationInfo = infos.pop();

				var isImage = infos.length === 1 && infos[0].image && !infos[0].video && !infos[0].audio;

				var passes = 1;
				
				var args = [];


				/*
				 * 
				 * Synchronize Audio & Video 
				 * 
				 */
				if (options.output_type === 'video') {
					if (options.remove_audio)
						args.push("-an");
					else if (options.synchronize)
						args.push(helpers.paramsSynchronize);
				}
				
				
				/*
				 * 
				 * Map Streams
				 * 
				 */
				if (options.output_type === 'audio') {
					args.push(helpers.paramsAudioOnly);
				} else if (options.output_type === 'video') {
					if (infos.length > 1) {
						var videoIdx = options.video_map || 0;
						args.push("-map " + videoIdx + ":" + infos[videoIdx].video.index);
                    }
					if (infos.length > 1) {
						var audioIdx = options.audio_map || 1;
						args.push("-map " + audioIdx + ":" + infos[audioIdx].audio.index);
                    }
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
				if (!isImage) {
                    if (options.output_type === 'image')
                        args.push(helpers.paramsImageExtraction(options.image_position, options.image_percentage, duration));
                    else if (options.time_start || options.time_end || options.time_limit)
                        args.push(helpers.paramsTimeDuration(options.time_start, options.time_end, options.time_limit));
                }
				
				
				var videoInfo = infos[0].video;
				var audioInfo = infos[1] ? infos[1].audio || infos[0].audio : infos[0].audio;
				
				
				var sourceWidth = 0;
				var sourceHeight = 0;
				var targetWidth = 0;
				var targetHeight = 0;
//try {
				
				if (options.output_type !== 'audio') {
					var source = infos[0];
					var sourceInfo = source.video || source.image;
					var requiredRotation = 0;
					if (options.auto_rotate && !(testInfo.capabilities && testInfo.capabilities.auto_rotate))
                        requiredRotation = sourceInfo.rotation % 360;
					if (options.rotate) {
                        requiredRotation = (requiredRotation + options.rotate) % 360;
						if (options.rotate % 180 === 90) {
							var temp = sourceInfo.rotated_width;
                            sourceInfo.rotated_width = sourceInfo.rotated_height;
                            sourceInfo.rotated_height = temp;
						}
					}
					sourceWidth = sourceInfo.rotated_width;
					sourceHeight = sourceInfo.rotated_height;
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
					var vfilters = [];
					var sizing = "";
					
					if (requiredRotation !== 0) {
						if (requiredRotation % 180 === 90) {
							vfilters.push("transpose=" + (requiredRotation === 90 ? 1 : 2));
						}
						if (requiredRotation === 180) {
							vfilters.push("hflip,vflip");
						}
						args.push("-metadata:s:v:0");
						args.push("rotate=0");
					}

					var modulus = options.output_type === 'video' ? helpers.videoFormats[options.video_format].modulus || 1 : 1;
					var modulusAdjust = function (value) {
						value = Math.round(value);
						return value % modulus === 0 ? value : (Math.round(value / modulus) * modulus);
					};

					if (modulusAdjust(sourceWidth) !== sourceWidth || modulusAdjust(sourceHeight) !== sourceHeight || options.width || options.height) {
						
						// Step 2: Fix Size & Ratio
						targetWidth = options.width || sourceWidth;
						targetHeight = options.height || sourceHeight;
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
						
						if (options.size_strategy === "shrink" && targetWidth > sourceWidth && targetHeight > sourceHeight) {
							targetWidth = ratioSourceTarget < 0 ? sourceHeight * targetRatio : sourceWidth;
							targetHeight = ratioSourceTarget >= 0 ? targetWidth / targetRatio : sourceHeight;
						} else if (options.size_strategy === "stretch" && targetWidth < sourceWidth && targetHeight < sourceHeight) {
							targetWidth = ratioSourceTarget >= 0 ? sourceHeight * targetRatio : sourceWidth;
							targetHeight = ratioSourceTarget < 0 ? targetWidth / targetRatio : sourceHeight;
						}
						
						var vf = [];

						// Step 3: Modulus

						targetWidth = modulusAdjust(targetWidth);
						targetHeight = modulusAdjust(targetHeight);

						var cropped = false;
						var addCrop = function (x, y, multi) {
							x = Math.round(x);
							y = Math.round(y);
							if (x === 0 && y === 0)
								return;
							cropped = true;
							var cropWidth = targetWidth - 2 * x;
							var cropHeight = targetHeight - 2 * y;
							vfilters.push("scale=" + [multi || ratioSourceTarget >= 0 ? cropWidth : targetWidth, !multi && ratioSourceTarget >= 0 ? targetHeight : cropHeight].join(":"));
							vfilters.push("crop=" + [!multi && ratioSourceTarget <= 0 ? cropWidth : targetWidth, multi || ratioSourceTarget <= 0 ? targetHeight : cropHeight, -x, -y].join(":"));
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
							vfilters.push("scale=" + [multi || ratioSourceTarget <= 0 ? padWidth : targetWidth, !multi && ratioSourceTarget <= 0 ? targetHeight : padHeight].join(":"));
							vfilters.push("pad=" + [!multi && ratioSourceTarget >= 0 ? padWidth : targetWidth, multi || ratioSourceTarget >= 0 ? targetHeight : padHeight, x, y].join(":"));
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
								vfilters.push("crop=" + [direction ? targetWidth : sourceWidth, direction ? sourceHeight : targetHeight, direction ? dirX : 0, direction ? 0 : dirY].join(":"));
								vfilters.push("pad=" + [targetWidth, targetHeight, direction ? 0 : dirX, direction ? dirY : 0].join(":"));
							}
						}
						
						if (!padded && !cropped)
							sizing = targetWidth + "x" + targetHeight;

					}			
					
					vfilters = vfilters.join(",");
				
					/*
					 * 
					 * Watermark (depends on sizing)
					 * 
					 */

					var watermarkFilters = options.watermarks.map(function (watermark, i) {
						var watermarkInfo = watermarkInfos[i];
						var watermarkMeta = watermarkInfo.image || watermarkInfo.video;
						var scaleWidth = watermarkMeta.width;
						var scaleHeight = watermarkMeta.height;
						var maxWidth = targetWidth * watermark.watermark_size;
						var maxHeight = targetHeight * watermark.watermark_size;
						if (scaleWidth > maxWidth || scaleHeight > maxHeight) {
							var watermarkRatio = maxWidth * scaleHeight >= maxHeight * scaleWidth;
							scaleWidth = watermarkRatio ? watermarkMeta.width * maxHeight / watermarkMeta.height : maxWidth;
							scaleHeight = !watermarkRatio ? watermarkMeta.height * maxWidth / watermarkMeta.width : maxHeight;
						}
						var posX = watermark.watermark_x * (targetWidth - scaleWidth);
						var posY = watermark.watermark_y * (targetHeight - scaleHeight);


						return [
							"[prewm" + i + "];",
							"movie=" + watermark.watermark + ",",
							"scale=" + [Math.round(scaleWidth), Math.round(scaleHeight)].join(":"),
							"[wm" + i + "];",
							"[prewm" + i + "][wm" + i + "]",
							"overlay=" + [Math.round(posX), Math.round(posY)].join(":")
						].join("");
					}).join("");

					if (watermarkFilters) {
						if (vfilters)
							vfilters = "[in]" + vfilters + watermarkFilters + "[out]";
						else
							vfilters = watermarkFilters.substring("[prewm0];".length).replace("[prewm0]", "[in]") + "[out]";
					}

					
					// Video Filters
					if (vfilters) {
						args.push("-vf");
						args.push(vfilters);
					}
					if (sizing) {
						args.push("-s");
						args.push(sizing);
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
					if (format && (format.fmt || format.vcodec || format.acodec || format.params)) {
						var acodec = format.acodec;
						if (Types.is_array(acodec)) {
							if (testInfo.encoders) {
								var encoders = Objs.objectify(testInfo.encoders);
								acodec = acodec.filter(function (codec) {
									return encoders[codec];
								});
							}
							if (acodec.length === 0)
								acodec = format.acodec;
							acodec = acodec[0];
						}
                        args.push(helpers.paramsVideoFormat(format.fmt, format.vcodec, acodec, format.params));
                    }
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
					var video_bit_rate = options.video_bit_rate;
					if (!video_bit_rate && videoInfo.bit_rate)
						video_bit_rate = videoInfo.bit_rate * Math.min(Math.max(targetWidth * targetHeight / sourceWidth / sourceHeight, 0.25), 4);
					if (!video_bit_rate)
						video_bit_rate = Math.round(1000 * (targetWidth + targetHeight) / 2);
					args.push(Math.round(video_bit_rate / 1000) + "k");
					if (audioInfo) {
						args.push("-b:a");
						var audio_bit_rate = options.audio_bit_rate || Math.max(audioInfo.bit_rate || 64000, 64000);
						args.push(Math.round(audio_bit_rate / 1000) + "k");
					}
				}

				// Workaround for https://trac.ffmpeg.org/ticket/6375
				if (options.maxMuxingQueueSize) {
					args.push("-max_muxing_queue_size");
					args.push("9999");
				}

//} catch(e) {console.log(e);}

//console.log(files, args, passes, output);
				return ffmpeg_multi_pass.ffmpeg_multi_pass(files, args, passes, output, function (progress) {
					if (eventCallback)
						eventCallback.call(eventContext || this, helpers.parseProgress(progress, duration));
				}, this, opts).mapSuccess(function () {
					return ffprobe_simple.ffprobe_simple(output, opts);
				}, this);
			});
			
			
		}
			
	};	
	
});

