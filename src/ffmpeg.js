Scoped.require([
    "betajs:Promise",
    "betajs:Types"
], function (Promise, Types) {
	
	var progress_regex = /\s*([^[=\s]+)\s*=\s*([^[=\s]+)/g;

	module.exports = {
			 
		ffmpeg: function (files, options, output, eventCallback, eventContext) {
			var promise = Promise.create();
			var commands = [];
			if (Types.is_string(files))
				files = [files];
			files.forEach(function (file) {
				commands.push("-i");
				commands.push(file);
			});
			commands = commands.concat(options);
			commands.push("-y");
			commands.push(output);		
//	console.log(commands.join(" "));
			var file = require("child_process").spawn("ffmpeg", commands.join(" ").split(" "));
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
			file.on("close", function (status) {
				if (status === 0) {
					promise.asyncSuccess();
				} else {
					var errlines = lines.split("\n");
					promise.asyncError(errlines[errlines.length - 2]);
				}
			});
			return promise;
		}
			
	};	
	
});

