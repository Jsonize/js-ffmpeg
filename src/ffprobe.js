Scoped.require([
    "betajs:Promise"
], function (Promise) {
	
	module.exports = {
			
		ffprobe: function (file) {
			var promise = Promise.create();
			var cmd = 'ffprobe -v quiet -print_format json -show_format -show_streams ' + file;
			require("child_process").exec(cmd, function (error, stdout, stderr) {
				if (error) {
					promise.asyncError("Cannot read file");
					return;
				}
				try {
					var success = JSON.parse(stdout);
					promise.asyncSuccess(success);
				} catch (e) {
					promise.asyncError("Parse error: " + stdout);
				}
			});
			return promise;
		}
			
	};	
	
});

