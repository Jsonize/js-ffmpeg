var jsffmpeg = require(__dirname + "/index.js");


Scoped.define("jsonize:JsonizeFfprobeTask", [
    "jsonize:AbstractJsonizeTask",
    "jsonize:JsonizeTaskRegistry",
    "betajs:Promise"
], function (Class, TaskRegistry, Promise, scoped) {
	var Cls = Class.extend({scoped: scoped}, {
		
		_run: function (payload) {
			return jsffmpeg.ffprobe(payload.source, {
				docker: payload.docker,
                timeout: payload.timeout,
				test_ffmpeg: payload.test_ffmpeg,
				test_info: payload.test_info
			});
		}
			
	});
	
	TaskRegistry.register("ffprobe", Cls);
	
	return Cls;
});


Scoped.define("jsonize:JsonizeFfprobeSimpleTask", [
     "jsonize:AbstractJsonizeTask",
     "jsonize:JsonizeTaskRegistry",
     "betajs:Promise"
], function (Class, TaskRegistry, Promise, scoped) {
 	var Cls = Class.extend({scoped: scoped}, {
 		
 		_run: function (payload) {
 			return jsffmpeg.ffprobe_simple(payload.source, {
                docker: payload.docker,
                timeout: payload.timeout,
                test_ffmpeg: payload.test_ffmpeg,
                test_info: payload.test_info
            });
 		}
 			
 	});
 	
 	TaskRegistry.register("ffprobe-simple", Cls);
 	
 	return Cls;
});


Scoped.define("jsonize:JsonizeFfmpegTask", [
     "jsonize:AbstractJsonizeTask",
     "jsonize:JsonizeTaskRegistry",
     "betajs:Promise"
], function (Class, TaskRegistry, Promise, scoped) {
 	var Cls = Class.extend({scoped: scoped}, {
 		
 		_run: function (payload) {
 			return jsffmpeg.ffmpeg(
 				payload.source || payload.sources,
 				payload.options || [],
 				payload.output,
 				this._event,
 				this,
                {
                    docker: payload.docker,
                    timeout: payload.timeout,
                    test_ffmpeg: payload.test_ffmpeg,
                    test_info: payload.test_info
                }
 			);
 		}
 			
 	});
 	
 	TaskRegistry.register("ffmpeg", Cls);
 	
 	return Cls;
});


Scoped.define("jsonize:JsonizeFfmpegMultiPassTask", [
	  "jsonize:AbstractJsonizeTask",
	  "jsonize:JsonizeTaskRegistry",
	  "betajs:Promise"
], function (Class, TaskRegistry, Promise, scoped) {
  	var Cls = Class.extend({scoped: scoped}, {
  		
  		_run: function (payload) {
  			return jsffmpeg.ffmpeg_multi_pass(
  				payload.source || payload.sources,
  				payload.options || [],
  				2,
  				payload.output,
  				this._event,
  				this,
                {
                    docker: payload.docker,
                    timeout: payload.timeout,
                    test_ffmpeg: payload.test_ffmpeg,
                    test_info: payload.test_info
                }
  			);
  		}
  			
  	});
  	
  	TaskRegistry.register("ffmpeg-multi-pass", Cls);
  	
  	return Cls;
});


Scoped.define("jsonize:JsonizeFfmpegSimpleTask", [
    "jsonize:AbstractJsonizeTask",
    "jsonize:JsonizeTaskRegistry",
    "betajs:Promise"
], function (Class, TaskRegistry, Promise, scoped) {
	var Cls = Class.extend({scoped: scoped}, {
		
		_run: function (payload) {
			return jsffmpeg.ffmpeg_simple(
				payload.source || payload.sources,
				payload.options || {},
				payload.output,
				this._event,
				this,
                {
                    docker: payload.docker,
                    timeout: payload.timeout,
                    test_ffmpeg: payload.test_ffmpeg,
                    test_info: payload.test_info
                }
			);
		}
			
	});
	
	TaskRegistry.register("ffmpeg-simple", Cls);
	
	return Cls;
});

Scoped.define("jsonize:JsonizeFfmpegFaststartTask", [
	"jsonize:AbstractJsonizeTask",
	"jsonize:JsonizeTaskRegistry",
	"betajs:Promise"
], function (Class, TaskRegistry, Promise, scoped) {
	var Cls = Class.extend({scoped: scoped}, {

		_run: function (payload) {
			return jsffmpeg.ffmpeg_faststart(
				payload.source || payload.sources,
				payload.output,
				this._event,
				this,
				{
					docker: payload.docker,
					timeout: payload.timeout,
					test_ffmpeg: payload.test_ffmpeg,
					test_info: payload.test_info
				}
			);
		}

	});

	TaskRegistry.register("ffmpeg-faststart", Cls);

	return Cls;
});


Scoped.define("jsonize:JsonizeFfmpegGracefulTask", [
    "jsonize:AbstractJsonizeTask",
    "jsonize:JsonizeTaskRegistry",
    "betajs:Promise"
], function (Class, TaskRegistry, Promise, scoped) {
    var Cls = Class.extend({scoped: scoped}, {

        _run: function (payload) {
            return jsffmpeg.ffmpeg_graceful(
                payload.source || payload.sources,
                payload.options || {},
                payload.output,
                this._event,
                this,
                {
                    docker: payload.docker,
                    timeout: payload.timeout,
                    test_ffmpeg: payload.test_ffmpeg,
                    test_info: payload.test_info
                }
            );
        }

    });

    TaskRegistry.register("ffmpeg-graceful", Cls);

    return Cls;
});


Scoped.define("jsonize:JsonizeFfmpegVolumeDetectTask", [
	"jsonize:AbstractJsonizeTask",
	"jsonize:JsonizeTaskRegistry",
	"betajs:Promise"
], function (Class, TaskRegistry, Promise, scoped) {
	var Cls = Class.extend({scoped: scoped}, {
		
		_run: function (payload) {
			return jsffmpeg.ffmpeg_volume_detect(payload.source, {
                docker: payload.docker,
				timeout: payload.timeout,
                test_ffmpeg: payload.test_ffmpeg,
                test_info: payload.test_info
            });
		}
			
	});
	
	TaskRegistry.register("ffmpeg-volume-detect", Cls);
	
	return Cls;
});
