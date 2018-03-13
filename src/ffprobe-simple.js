Scoped.require([
    "betajs:Promise",
    "betajs:Strings"
], function (Promise, Strings) {
	
	module.exports = {
			
		ffprobe_simple: function (file, options) {
			var parseIntUndefined = function (source, key) {
				return key in source ? parseInt(source[key], 10) : undefined;
			};
			
			if (!require('fs').existsSync(file))
				return Promise.error("File does not exist");
			return require(__dirname + "/ffprobe.js").ffprobe(file, options).mapSuccess(function (json) {
				if (!json.format || !json.streams)
					return Promise.error("Cannot read file");
				var result = {
					filename: json.format.filename,
					stream_count: json.format.nb_streams,
					size: parseInt(json.format.size, 10),
					bit_rate: parseInt(json.format.bit_rate, 10),
					start_time: parseFloat(json.format.start_time),
					duration: parseFloat(json.format.duration),
					format_name: json.format.format_long_name,
					format_extensions: json.format.format_name.split(","),
					format_default_extension: Strings.splitFirst(json.format.format_name, ",").head				
				};
				json.streams.forEach(function (stream) {
					if (stream.codec_type === 'video') {
						var rotation = stream.tags && stream.tags.rotate ? parseInt(stream.tags.rotate, 10) : 0; 
						var video = {
							index: stream.index,
							rotation: rotation,
							width: stream.width,
							height: stream.height,
							rotated_width: rotation % 180 === 0 ? stream.width : stream.height,
							rotated_height: rotation % 180 === 0 ? stream.height : stream.width,
							codec_name: stream.codec_tag_string,
							codec_long_name: stream.codec_long_name,
							codec_profile: stream.profile,
							bit_rate: parseIntUndefined(stream, "bit_rate"),
							frames: parseIntUndefined(stream, "nb_frames")
						};
						if (json.format.format_name === "image" || json.format.format_name === "image2" || stream.codec_name === 'png')
							result.image = video;
						else
							result.video = video;
					} else if (stream.codec_type === 'audio') {
						result.audio = {
							index: stream.index,
							codec_name: stream.codec_name,
							codec_long_name: stream.codec_long_name,
							codec_profile: stream.profile,
							audio_channels: stream.channels,
							sample_rate: parseIntUndefined(stream, "sample_rate"),
							bit_rate: parseIntUndefined(stream, "bit_rate")
						};
					}
				});
				return result;
			});
		}
			
	};

});
