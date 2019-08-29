Scoped.require([
    "betajs:Promise"
], function (Promise) {

	var DockerPolyfill = require("docker-polyfill");

	var VersionRegex = /^ffmpeg version (\d+)\.(\d+)\.(\d+).*$/i;
	var ConfigurationRegex = /^\s+configuration:\s(.*)$/i;
	var CodecRegexDecoders = /^\s*(.)(.)(.)(.)(.)(.)\s+(\w+)\s+(.+)\s*\(decoders:\s([^)]+)\s\)\s*(?:\(encoders:\s([^)]+)\s\))?\s*$/i;
    var CodecRegexEncoders = /^\s*(.)(.)(.)(.)(.)(.)\s+(\w+)\s+(.+)\s*\(encoders:\s([^)]+)\s\)\s*$/i;
    var CodecRegexNone = /^\s*(.)(.)(.)(.)(.)(.)\s+(\w+)\s+(.+)\s*$/i;

	module.exports = {
			
		ffmpeg_test: function (options) {
			options = options || {};
			var promise = Promise.create();
			var cmd = 'ffmpeg';
			var args = ['-codecs'];
			var file = DockerPolyfill.polyfillRun({
				command: options.ffmpeg_binary || "ffmpeg",
				argv: ["-codecs"],
				docker: options.docker,
                timeout: options.timeout
			});
			var stderr = "";
			file.stderr.on("data", function (data) {
				stderr += data;
			});
			var stdout = "";
            file.stdout.on("data", function (data) {
                stdout += data;
            });
			var timeouted = false;
			file.on("timeout", function () {
				timeouted = true;
				promise.asyncError("Timeout reached");
			});
            file.on("close", function (status) {
				if (timeouted)
					return;
                if (status !== 0) {
                    promise.asyncError("Cannot execute ffmpeg");
                    return;
				}
				var result = {
					version: {},
					codecs: {},
					capabilities: {
                        auto_rotate: false
					},
					encoders: [],
					decoders: []
				};
				stderr.split("\n").forEach(function (line) {
					var versionMatch = VersionRegex.exec(line);
					if (versionMatch) {
						result.version.major = parseInt(versionMatch[1], 10);
						result.version.minor = parseInt(versionMatch[2], 10);
						result.version.revision = parseInt(versionMatch[3], 10);
					}
					var configurationMatch = ConfigurationRegex.exec(line);
					if (configurationMatch)
						result.configuration = configurationMatch[1].split(" ");
				});
				stdout.split("\n").forEach(function (line) {
					var decodersIdx = 9;
					var encodersIdx = 10;
					var codecMatch = CodecRegexDecoders.exec(line);
					if (!codecMatch) {
                        decodersIdx = 10;
                        encodersIdx = 9;
                        codecMatch = CodecRegexEncoders.exec(line);
                        if (!codecMatch)
                            codecMatch = CodecRegexNone.exec(line);
					}
					if (codecMatch) {
						var codec = {
							support: {
								decoding: codecMatch[1] === 'D',
                                encoding: codecMatch[2] === 'E',
                                video: codecMatch[3] === 'V',
                                audio: codecMatch[3] === 'A',
                                intra: codecMatch[4] === 'I',
                                lossy: codecMatch[5] === 'L',
                                lossless: codecMatch[6] === 'S'
							},
							short_name: codecMatch[7],
							long_name: codecMatch[8],
							decoders: codecMatch[decodersIdx] ? codecMatch[decodersIdx].split(" ") : [],
                            encoders: codecMatch[encodersIdx] ? codecMatch[encodersIdx].split(" ") : []
                        };
                        result.codecs[codecMatch[7]] = codec;
						result.decoders = result.decoders.concat(codec.decoders);
						result.encoders = result.encoders.concat(codec.encoders);
                    }
				});
				if (result.version.major >= 3)
					result.capabilities.auto_rotate = true;
				promise.asyncSuccess(result);
			});
			return promise;
		}
			
	};	
	
});

