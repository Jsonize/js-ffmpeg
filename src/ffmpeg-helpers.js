Scoped.require([
    "betajs:TimeFormat"                
], function (TimeFormat) {
	
	module.exports = {
		
		parseTimeCode: function (timecode) {
			var m = /(\d\d):(\d\d):(\d\d)\.(\d\d)/.exec(timecode);
			return m ? parseInt(m[1], 10) * 60 * 60 + parseInt(m[2], 10) * 60 + parseInt(m[3], 10) + parseInt(m[4], 10) / 100 : null;
		},
		
		formatTimeCode: function (seconds) {
			return TimeFormat.format("HH:MM:ss.L", Math.floor(seconds * 1000));
		},
		
		videoFormats: {
			"mp4": {
				bframes: true,
				acodec: ["libfaac", "libfdk_aac", "libvo_aacenc", "aac"],
				vcodec: "libx264",
				fmt: "mp4",
				passes: 2,
				modulus: 2,
				params: "-pix_fmt yuv420p"
			},
			"ogg": {
				bframes: true,
				acodec: "libvorbis",
				vcodec: "libtheora"
			},
			"webm": {
				bframes: true,
				acodec: "libvorbis",
				vcodec: "libvpx",
				fmt: "webm"
			},
			"wmv": {
				acodec: "wmav2",
				vcodec: "wmv2"
			},
			"wmv3": {
				acodec: "wmav3",
				vcodec: "wmv3"
			},
			"flv": {
				fmt: "flv",
				params: "-ar 44100"
			}
		},
		
		paramsSynchronize: "-async 1 -metadata:s:v:0 start_time=0",
		
		paramsAudioOnly: "-vn",
		
		paramsFormatImage: "-f image2",
			
		paramsVideoMap: function (index) { return "-map " + "0:" + index; },
		
		paramsAudioMap: function (index) { return "-map " + "1:" + index; },
		
		paramsVideoCodecUniversalConfig: "-refs 6 -coder 1 -sc_threshold 40 -flags +loop -me_range 16 -subq 7 -i_qfactor 0.71 -qcomp 0.6 -qdiff 4 -trellis 1",
		
		paramsTimeDuration: function (time_start, time_end, time_limit) {
			var args = [];
			if (time_start) {
				args.push("-ss");
				args.push(this.formatTimeCode(time_start));
			}
			if (time_end) {
				args.push("-t");
				args.push(this.formatTimeCode(time_end));
			}
			if (time_limit)  {
				args.push("-t");
				args.push(this.formatTimeCode((time_start || 0) + time_limit));
			}
			return args.join(" ");
		},
		
		paramsFramerate: function (framerate, bframes, framerate_gop) {
			return "-r " + framerate + (bframes ? " -b_strategy 1 -bf 3 -g " + framerate_gop : "");
		},
		
		paramsVideoProfile: function (video_profile) {
			return "-profile:v " + video_profile;
		},
		
		paramsFastStart: "-movflags faststart",
		
		paramsVideoFormat: function (fmt, vcodec, acodec, params) {
			var args = [];
			if (fmt) {
				args.push("-f");
				args.push(fmt);
			}
			if (vcodec) {
				args.push("-vcodec");
				args.push(vcodec);
			}
			if (acodec) {
				args.push("-acodec");
				args.push(acodec);
			}
			if (params)
				args.push(params);
			return args.join(" ");
		},
		
		paramsImageExtraction: function (image_position, image_percentage, duration) {
			var args = [];
			args.push("-ss");
			if (image_position !== null)
				args.push(this.formatTimeCode(image_position));
			else if (image_percentage !== null)
				args.push(this.formatTimeCode(image_percentage * duration));
			else
				args.push(this.formatTimeCode(0.5 * duration));
			args.push("-vframes");
			args.push("1");
			return args.join(" ");
		},
		
		parseProgress: function (progress, duration) {
			var raw = {};
			if (progress.frame)
				raw.frame = parseInt(progress.frame, 10);
			if (progress.fps)
				raw.fps = parseFloat(progress.fps);
			if (progress.q)
				raw.q = parseFloat(progress.q);
			if (progress.size)
				raw.size_kb = parseInt(progress.size, 10);
			if (progress.bitrate)
				raw.bitrate_kbits = parseFloat(progress.bitrate);
			if (progress.dup)
				raw.dup = parseInt(progress.dup, 10);
			if (progress.drop)
				raw.drop = parseInt(progress.drop, 10);
			if (progress.time) 
				raw.time = this.parseTimeCode(progress.time);
			raw.pass = progress.pass || 1;
			raw.passes = progress.passes || 1;
			if (duration && raw.time)
				raw.progress = (raw.pass - 1) / raw.passes + raw.time / duration / raw.passes;
			return raw;
		},
		
		computeDuration: function (duration, time_start, time_end, time_limit) {
			if (time_start) 
				duration -= time_start;
			if (time_end)
				duration -= time_end - (time_start || 0);
			if (time_limit)
				duration = Math.min(duration, time_limit);
			return duration;
		}
			
	};
	
});