module.exports = function(grunt) {
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		browserify: {
			build: {
				files: {
					'build/scripts/app.bundle.js': ['app/lib/game.js', 'app/lib/render.js', 'app/lib/tetrominoRotations.js']
				}
			}
		},

		copy: {
			scripts: {
				src: [
					'bower_components/easeljs/lib/easeljs-0.8.0.combined.js',
					'bower_components/tweenjs/src/Tween.js'
				],
				dest: 'build/scripts/',
				expand: true,
				flatten: true
			},
			html: {
				src: [
					'app/index.html',
				],
				dest: 'build/',
				expand: true,
				flatten: true
			},
			css: {
				src: [
					'app/css/game.css',
				],
				dest: 'build/css/',
				expand: true,
				flatten: true
			},
			images: {
				cwd: 'app/images/',
				dest: 'build/images/',
				src: '**/*.*',
				expand: true
			}
		},

		connect: {
			server: {
				options: {
					port: 9001,
					base: 'build'
				}
			}
		},

		watch: {
			options: {
				livereload: true
			},
			scripts: {
				files: ['app/lib/**/*.js', 'app/*.html', 'app/*.css'],
				tasks: ['build']
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-browserify');

	grunt.registerTask('build', ['browserify', 'copy']);
	grunt.registerTask('default', ['build', 'connect', 'watch']);

};