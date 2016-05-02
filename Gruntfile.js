module.exports = function(grunt) {

	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		'node-qunit' : {
			dist : {
				code : './index.js',
				tests : grunt.file.expand("./tests/tests/*.js"),
				done : function(err, res) {
					publishResults("node", res, this.async());
				}
			}
		},
		jshint : {
			options : {
				es5 : false,
				es3 : true
			},
			source : [ "./Gruntfile.js", "./index.js", "./tests/tests/*.js",
					"./src/*.js" ]
		}
	});

	grunt.loadNpmTasks('grunt-node-qunit');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', [ 'jshint', 'node-qunit' ]);

};