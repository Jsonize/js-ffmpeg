Scoped.require([
    "betajs:Promise",
    "betajs:Types",
    "betajs:Objs"
], function (Promise, Types, Objs) {
	
	var ffmpeg = require(__dirname + "/ffmpeg.js");
	var tmp = require('tmp');
	
	module.exports = {
			 
		ffmpeg_multi_pass: function (files, options, passes, output, eventCallback, eventContext, opts) {
			options = options || [];

			if (passes === 1)
				return ffmpeg.ffmpeg(files, options, output, eventCallback, eventContext, opts);
			 
			var promise = Promise.create();
			
			tmp.file(function (err, path, fd, cleanupCallback) {
				if (err) {
					promise.asyncError(err);
					return;
			    }
				promise.callback(function () {
					cleanupCallback();
				});
				ffmpeg.ffmpeg(files, options.concat([
	                '-pass',
	                '1',
	                '-passlogfile',
	                path
	            ]), output, function (progress) {
					progress.pass = 1;
					progress.passes = 2;
					if (eventCallback)
						eventCallback.call(this, progress);
				}, this, opts).forwardError(promise).success(function () {
					ffmpeg.ffmpeg(files, options.concat([
     	                '-pass',
    	                '2',
    	                '-passlogfile',
    	                path
                    ]), output, function (progress) {
						progress.pass = 2;
						progress.passes = 2;
						if (eventCallback)
							eventCallback.call(this, progress);
					}, this, opts).forwardCallback(promise);
				}, this);
			});
				
			return promise;
		}
			
	};
	
});

