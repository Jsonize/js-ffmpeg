Scoped.require([
    "betajs:Promise"
], function (Promise) {

	var DockerPolyfill = require("docker-polyfill");
	
	module.exports = {
			
		ffprobe: function (fileName, options) {
			options = options || {};
			var promise = Promise.create();
			var file = DockerPolyfill.polyfillRun({
				command: "ffprobe",
				argv: ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', fileName],
				docker: options.docker
			});
			/*
            var stderr = "";
            file.stderr.on("data", function (data) {
                stderr += data;
            });
            */
            var stdout = "";
            file.stdout.on("data", function (data) {
                stdout += data;
            });
            file.on("close", function (error) {
				if (error) {
					promise.asyncError("Cannot read file");
					return;
				}
				try {
					var success = JSON.parse(stdout);
					promise.asyncSuccess(success);
				} catch (e) {
					promise.asyncError("FFProbe Parse error: " + stdout);
				}
			});
			return promise;
		}
			
	};	
	
});

