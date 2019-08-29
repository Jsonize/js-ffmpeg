Scoped.require([
    "betajs:Promise",
    "betajs:Types"
], function (Promise, Types) {

    var DockerPolyfill = require("docker-polyfill");

	var mean_volume_regex = /.*mean_volume:\s*([^[\s]+)\s*/g;
	var max_volume_regex = /.*max_volume:\s*([^[\s]+)\s*/g;
	
	module.exports = {
			 
		ffmpeg_volume_detect: function (inputFile, options) {
			options = options || {};
			var promise = Promise.create();
			var file = DockerPolyfill.polyfillRun({
				command: options.ffmpeg_binary || "ffmpeg",
				argv: [
                    "-i",
                    inputFile,
                    "-vn",
                    "-af",
                    "volumedetect",
                    "-f",
                    "null",
                    "/dev/null"
                ],
				docker: options.docker,
                timeout: options.timeout
			});
			var lines = "";
			file.stderr.on("data", function (data) {
				var line = data.toString();
				lines += line;
			});
			file.stderr.on("end", function (data) {
				lines += data;
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
                    promise.asyncError("Cannot read file");
                    return;
                }
				lines = lines.split("\n");
				if (status === 0) {
					var mean_volume = null;
					var max_volume = null;
					lines.forEach(function (line) {
						var mean_volume_match = mean_volume_regex.exec(line);
						if (mean_volume_match)
							mean_volume = parseFloat(mean_volume_match[1]);
						var max_volume_match = max_volume_regex.exec(line);
						if (max_volume_match)
							max_volume = parseFloat(max_volume_match[1]);
					});
					promise.asyncSuccess({
						mean_volume: mean_volume,
						max_volume: max_volume
					});
				} else {
					promise.asyncError(lines[lines.length - 2]);
				}
			});
			return promise;
		}
			
	};	
	
});

