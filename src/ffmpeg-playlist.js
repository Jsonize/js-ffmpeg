Scoped.require([
	"betajs:Promise",
	"betajs:Types",
	"betajs:Objs"
], function(Promise, Types, Objs) {
	const FS = require("fs");

	var ffmpeg_multi_pass = require(__dirname + "/ffmpeg-multi-pass.js");
	var ffprobe_simple = require(__dirname + "/ffprobe-simple.js");
	var ffmpeg_volume_detect = require(__dirname + "/ffmpeg-volume-detect.js");
	var helpers = require(__dirname + "/ffmpeg-helpers.js");
	var ffmpeg_test = require(__dirname + "/ffmpeg-test.js");

	module.exports = {

		ffmpeg_playlist: function(files, options, output, eventCallback, eventContext, opts) {
			return this.ffmpeg_playlist_raw(files, options, output, eventCallback, eventContext, opts).mapError(function(e) {
				if (e.logs) {
					if (e.logs.indexOf("Too many packets buffered for output stream") >= 0 && !options.maxMuxingQueueSize) {
						options.maxMuxingQueueSize = true;
						return this.ffmpeg_playlist_raw(files, options, output, eventCallback, eventContext, opts);
					}
				}
				return e;
			}, this);
		},

		ffmpeg_playlist_raw: function(files, options, output, eventCallback, eventContext, opts) {
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
				video_format: "m3u8",

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

				maxMuxingQueueSize: false,

				segment_target_duration: 4,
				max_bitrate_ratio: 1.07,
				rate_monitor_buffer_ratio: 1.5,
				key_frames_interval: 25,
				renditions: [
					{resolution: "640x360", bitrate: 800, audio_rate: 96},
					{resolution: "842x480", bitrate: 1400, audio_rate: 128},
					{resolution: "1280x720", bitrate: 2800, audio_rate: 128},
					{resolution: "1920x1080", bitrate: 5000, audio_rate: 192}
				]
			}, options);

			var promises = files.map(function(file) {
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
			options.watermarks.forEach(function(wm) {
				promises.push(ffprobe_simple.ffprobe_simple(wm.watermark, opts));
			}, this);
			if (opts.test_ffmpeg)
				promises.push(ffmpeg_test.ffmpeg_test(opts));

			return Promise.and(promises).mapSuccess(function(infos) {

				var testInfo = opts.test_info || {};
				if (opts.test_ffmpeg)
					testInfo = infos.pop();

				var watermarkInfos = [];
				options.watermarks.forEach(function() {
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
				if (options.remove_audio) {
					args.push("-an");
				} else if (options.synchronize) {
					args.push(helpers.paramsSynchronize);
				}

				/*
				 * 
				 * Map Streams
				 * 
				 */
				if (infos.length > 1) {
					var videoIdx = options.video_map || 0;
					args.push("-map " + videoIdx + ":" + infos[videoIdx].video.index);
				}
				if (infos.length > 1) {
					var audioIdx = options.audio_map || 1;
					args.push("-map " + audioIdx + ":" + infos[audioIdx].audio.index);
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
				var duration = helpers.computeDuration(infos[0].duration, options.time_start, options.time_end,
						options.time_limit);
				if (options.time_start || options.time_end || options.time_limit)
					args.push(helpers.paramsTimeDuration(options.time_start, options.time_end, options.time_limit));

				var videoInfo = infos[0].video;
				var audioInfo = infos[1] ? infos[1].audio || infos[0].audio : infos[0].audio;

				var sourceWidth = 0;
				var sourceHeight = 0;
				var targetWidth = 0;
				var targetHeight = 0;
//try {

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

				var renditionArgs = {};
				Objs.iter(options.renditions, function(rendition, i) {
					// Step 1: Fix Rotation
					renditionArgs[rendition.resolution] = {};
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

					let widthHeight = rendition.resolution.split("x");
					let renditionWidth = Types.parseInt(widthHeight[0]);
					let renditionHeight = Types.parseInt(widthHeight[1]);

					var modulus = options.output_type === "video" ? helpers.videoFormats[options.video_format].modulus || 1 : 1;
					var modulusAdjust = function(value) {
						value = Math.round(value);
						return value % modulus === 0 ? value : (Math.round(value / modulus) * modulus);
					};

					if (modulusAdjust(sourceWidth) !== sourceWidth || modulusAdjust(sourceHeight) !== sourceHeight ||
							renditionWidth || renditionHeight) {

						// Step 2: Fix Size & Ratio
						targetWidth = renditionWidth || sourceWidth;
						targetHeight = renditionHeight || sourceHeight;
						targetRatio = targetWidth / targetHeight;
						ratioSourceTarget = Math.sign(sourceWidth * targetHeight - targetWidth * sourceHeight);

						if (options.ratio_strategy !== "fixed" && ratioSourceTarget !== 0) {
							if ((options.ratio_strategy === "stretch" && ratioSourceTarget > 0) ||
									(options.ratio_strategy === "shrink" && ratioSourceTarget < 0))
								targetWidth = targetHeight * sourceRatio;
							if ((options.ratio_strategy === "stretch" && ratioSourceTarget < 0) ||
									(options.ratio_strategy === "shrink" && ratioSourceTarget > 0))
								targetHeight = targetWidth / sourceRatio;
							targetRatio = sourceRatio;
							ratioSourceTarget = 0;
						}

						if (options.size_strategy === "shrink" && targetWidth > sourceWidth && targetHeight > sourceHeight) {
							targetWidth = ratioSourceTarget < 0 ? sourceHeight * targetRatio : sourceWidth;
							targetHeight = ratioSourceTarget >= 0 ? targetWidth / targetRatio : sourceHeight;
						} else if (options.size_strategy === "stretch" && targetWidth < sourceWidth && targetHeight <
								sourceHeight) {
							targetWidth = ratioSourceTarget >= 0 ? sourceHeight * targetRatio : sourceWidth;
							targetHeight = ratioSourceTarget < 0 ? targetWidth / targetRatio : sourceHeight;
						}

						var vf = [];

						// Step 3: Modulus

						targetWidth = modulusAdjust(targetWidth);
						targetHeight = modulusAdjust(targetHeight);

						var cropped = false;
						var addCrop = function(x, y, multi) {
							x = Math.round(x);
							y = Math.round(y);
							if (x === 0 && y === 0)
								return;
							cropped = true;
							var cropWidth = targetWidth - 2 * x;
							var cropHeight = targetHeight - 2 * y;
							vfilters.push("scale=" + [
								multi || ratioSourceTarget >= 0 ? cropWidth : targetWidth,
								!multi && ratioSourceTarget >= 0 ? targetHeight : cropHeight].join(":"));
							vfilters.push("crop=" + [
								!multi && ratioSourceTarget <= 0 ? cropWidth : targetWidth,
								multi || ratioSourceTarget <= 0 ? targetHeight : cropHeight,
								-x,
								-y].join(":"));
						};
						var padded = false;
						var addPad = function(x, y, multi) {
							x = Math.round(x);
							y = Math.round(y);
							if (x === 0 && y === 0)
								return;
							padded = true;
							var padWidth = targetWidth - 2 * x;
							var padHeight = targetHeight - 2 * y;
							vfilters.push("scale=" + [
								multi || ratioSourceTarget <= 0 ? padWidth : targetWidth,
								!multi && ratioSourceTarget <= 0 ? targetHeight : padHeight].join(":"));
							vfilters.push("pad=" + [
								!multi && ratioSourceTarget >= 0 ? padWidth : targetWidth,
								multi || ratioSourceTarget >= 0 ? targetHeight : padHeight,
								x,
								y].join(":"));
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
								vfilters.push("crop=" + [
									direction ? targetWidth : sourceWidth,
									direction ? sourceHeight : targetHeight,
									direction ? dirX : 0,
									direction ? 0 : dirY].join(":"));
								vfilters.push(
										"pad=" + [targetWidth, targetHeight, direction ? 0 : dirX, direction ? dirY : 0].join(":"));
							}
						}

						if (!padded && !cropped)
							renditionArgs[rendition.resolution].sizing = targetWidth + "x" + targetHeight;

					}

					vfilters = vfilters.join(",");

					/*
					 *
					 * Watermark (depends on sizing)
					 *
					 */

					var watermarkFilters = options.watermarks.map(function(watermark, i) {
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

					renditionArgs[rendition.resolution].vf = vfilters;

				});
				/*
				 * 
				 * Format
				 *
				 */

				if (options.video_profile && options.video_format === "mp4") {
					args.push(helpers.paramsVideoProfile(options.video_profile));
				}
				if (options.faststart && options.video_format === "mp4") {
					args.push(helpers.paramsFastStart);
				}
				var format = helpers.videoFormats[options.video_format];
				if (format && (format.fmt || format.vcodec || format.acodec || format.params)) {
					var acodec = format.acodec;
					if (Types.is_array(acodec)) {
						if (testInfo.encoders) {
							var encoders = Objs.objectify(testInfo.encoders);
							acodec = acodec.filter(function(codec) {
								return encoders[codec];
							});
						}
						if (acodec.length === 0)
							acodec = format.acodec;
						acodec = acodec[0];
					}
					args.push(helpers.paramsVideoFormat(format.fmt, format.vcodec, acodec, format.params));
				}
				args.push(...helpers.paramsVideoCodecUniversalConfig.split(" "));
				if (format && format.passes > 1)
					passes = format.passes;

				// Workaround for https://trac.ffmpeg.org/ticket/6375
				if (options.maxMuxingQueueSize) {
					args.push("-max_muxing_queue_size");
					args.push("9999");
				}

				let newArgs = [];
				const target = output;
				if (!FS.existsSync(target))
					FS.mkdirSync(target, {recursive: true});
				let masterPlaylist = "#EXTM3U\n#EXT-X-VERSION:3\n";
				const keyFramesInterval = options.key_frames_interval;
				let staticParams = `-g ${keyFramesInterval} -keyint_min ${keyFramesInterval} -hls_time ${options.segment_target_duration}`;
				staticParams += ` -hls_playlist_type vod`;
				Objs.iter(options.renditions, function(obj, i) {
					let resolution = renditionArgs[obj.resolution].sizing ? renditionArgs[obj.resolution].sizing : obj.resolution;
					let widthHeight = resolution.split("x");
					let width = Types.parseInt(widthHeight[0]);
					let height = Types.parseInt(widthHeight[1]);
					let maxRate = obj.bitrate * options.max_bitrate_ratio;
					let bufSize = obj.bitrate * options.rate_monitor_buffer_ratio;
					let bandwidth = obj.bitrate * 1000;
					let name = `${height}p`;
					newArgs.push(...args);
					newArgs.push(...staticParams.split(" "));
					if (renditionArgs[obj.resolution].vf) {
						newArgs.push(...`-vf ${renditionArgs[obj.resolution].vf}`.split(" "));
					} else {
						newArgs.push(...`-vf scale=w=${width}:h=${height}:force_original_aspect_ratio=decrease`.split(" "));
					}
					newArgs.push(
							...`-b:v ${obj.bitrate}k -maxrate ${maxRate}k -bufsize ${bufSize}k -b:a ${obj.audio_rate}k`.split(" "));
					newArgs.push(...`-hls_segment_filename ${target}/${name}_%03d.ts ${target}/${name}.m3u8`.split(" "));
					masterPlaylist += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${name}.m3u8\n`;
				});
				return ffmpeg_multi_pass.ffmpeg_multi_pass(files, newArgs, passes, null, function(progress) {
					if (eventCallback)
						eventCallback.call(eventContext || this, helpers.parseProgress(progress, duration));
				}, this, opts).mapSuccess(function() {
					FS.writeFileSync(target + "/playlist.m3u8", masterPlaylist);
					return Promise.value({playlist: target + "/playlist.m3u8"});
				}, this);
			});

		}

	};

});

