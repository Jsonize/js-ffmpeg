module.exports = function(grunt) {

	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		shell : {
			qunit : {
				command: ["node_modules/qunitjs/bin/qunit"].concat(["index.js", "tests/tests/*.js"]).join(" "),
            	options: {
            		stdout: true,
                	stderr: true
        		},
				src: [
					"index.js", "tests/tests/*.js"
				]
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

	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', [ 'jshint', 'shell:qunit' ]);

};