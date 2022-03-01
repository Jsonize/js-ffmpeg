Scoped.require([
	"betajs:Promise",
	"betajs:Types",
	"betajs:Objs"
], function(Promise, Types, Objs) {

	var ffmpeg = require(__dirname + "/ffmpeg.js");
	var helpers = require(__dirname + "/ffmpeg-helpers.js");
	module.exports = {

		ffmpeg_faststart: function(file, output, eventCallback, eventContext, opts) {
			const options = [];
			options.push("-c copy");
			options.push(helpers.paramsFastStart);
			return ffmpeg.ffmpeg(file, options, output, eventCallback, eventContext, opts);
		}

	};

});

