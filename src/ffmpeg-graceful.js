Scoped.require([
    "betajs:Promise",
    "betajs:Types",
    "betajs:Objs"
], function (Promise, Types, Objs) {
	
    var ffmpeg_simple = require(__dirname + "/ffmpeg-simple.js");
    var tmp = require('tmp');
	
	module.exports = {
			 
		ffmpeg_graceful: function (files, options, output, eventCallback, eventContext, opts) {
			options = options || {};
			return ffmpeg_simple.ffmpeg_simple(files, options, output, eventCallback, eventContext, opts).mapError(function (err) {
				if ((Types.is_array(files) && files.length > 1) || options.output_type === 'audio' || options.output_type === "image")
					return err;

                var promise = Promise.create();

                tmp.file({postfix: ".aac"}, function (err, audioFile, fd, cleanupCallback) {
                    if (err) {
                        promise.asyncError(err);
                        return;
                    }
                    promise.callback(function () {
                        cleanupCallback();
                    });
                    tmp.file(function (err, videoFile, fd, cleanupCallback) {
                        if (err) {
                            promise.asyncError(err);
                            return;
                        }
                        promise.callback(function () {
                            cleanupCallback();
                        });
                        ffmpeg_simple.ffmpeg_simple(files, {output_type: "audio"}, audioFile, eventCallback, eventContext, opts).forwardError(promise).success(function () {
                            ffmpeg_simple.ffmpeg_simple(files, {output_type: "video", remove_audio: true }, videoFile, eventCallback, eventContext, opts).forwardError(promise).success(function () {
                            	ffmpeg_simple.ffmpeg_simple([videoFile, audioFile], options, output, eventCallback, eventContext, opts).forwardCallback(promise);
                            });
                        });
                    });
                });

                return promise;
			});
		}
			
	};	
	
});

