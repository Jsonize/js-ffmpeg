Scoped.require([
    "betajs:Promise"
], function (Promise) {
	
	module.exports = {
			
		ffprobe: function (file) {
			var promise = Promise.create();
			var cmd = 'ffprobe -v quiet -print_format json -show_format -show_streams ' + file;
			require("child_process").exec(cmd, function (error, stdout, stderr) {
				var success = JSON.parse(stdout);
				promise.asyncSuccess(success);
			});
			return promise;
		}
			
	};	
	
});

