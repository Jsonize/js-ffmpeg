Scoped.require([
    "betajs:Promise",
    "betajs:Types"
], function (Promise, Types) {

    var DockerPolyfill = require("docker-polyfill");
    var FS = require("fs");
	
	var progress_regex = /\s*([^[=\s]+)\s*=\s*([^[=\s]+)/g;

	module.exports = {
			 
		ffmpeg: function (files, options, output, eventCallback, eventContext, opts) {
			opts = opts || {};
			var promise = Promise.create();
			var args = [];
			if (Types.is_string(files))
				files = [files];
			files.forEach(function (file) {
				args.push("-i");
				args.push(file);
			});
            args = args.concat(options);
            args.push("-y");
            args.push(output);
            // Touch file so docker keeps the right owner
            FS.writeFileSync(output, "");
			//	console.log(args.join(" "));
			var file = DockerPolyfill.polyfillRun({
				command: opts.ffmpeg_binary || "ffmpeg",
				argv: args.join(" ").split(" "),
				docker: opts.docker,
				timeout: opts.timeout
			});
			var lines = "";
			file.stderr.on("data", function (data) {
				var line = data.toString();
				lines += line;
				if (line.indexOf("frame=") === 0) {
					var progress = line.trim();
					var result = {};
					while (true) {
						var m = progress_regex.exec(progress);
						if (!m)
							break;
						result[m[1]] = m[2];
					}
					if (eventCallback)
						eventCallback.call(eventContext || this, result);
				}
			});
			file.stderr.on("end", function (data) {
				lines += data;
			});
			var timeouted = false;
			file.on("timeout", function () {
				timeouted = true;
				promise.asyncError({
					message: "Timeout reached",
					command: args.join(" ")
				});
			});
			file.on("close", function (status) {
				if (timeouted)
					return;
				if (status === 0) {
					promise.asyncSuccess();
                } else {
					var errlines = lines.split("\n");
					promise.asyncError({
						message: errlines[errlines.length - 2],
						logs: lines,
						command: args.join(" ")
					});
				}
			});
			return promise;
		}
			
	};	
	
});

