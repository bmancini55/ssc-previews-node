
module.exports = function(grunt) {
  
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');  
  grunt.loadNpmTasks('grunt-express-runner');
  grunt.loadNpmTasks('grunt-contrib-watch'); 
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean'); 
  
  grunt.initConfig({    
    jshint: {
      options: {
        jshintrc: true
      },
      grunt: {
        src: [ 'GruntFile.js' ]        
      },      
      server: {
        src: [ 'src/server/**/*.js' ]        
      },
      test: {
        src: [ 'test/**/*.js' ]  
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },        
        src: ['test/**/*.js']
      }      
    },    
    expressrunner: {
      options: {
        script: 'src/server.js',
        debug: 'previews*'
      }
    },
    watch: {
      server: { 
        files: 'src/**/*',
        tasks: [ 'expressrunner' ],
        options: {
          interrupt: true,
          atBegin: true
        }
      }
    },
    clean: {
      lib: ['src/public/lib']
    },
    copy: {      
      lib: {
        files: [{
          expand: true,
          cwd: 'bower_components/bootstrap/dist',
          src: '**/*',                       
          dest: 'src/public/lib/bootstrap'
        }, {
          expand: true,
          cwd: 'bower_components/jquery/dist',
          src: '**/*',
          dest: 'src/public/lib/jquery'
        }]
      }
    } 
  });

  grunt.registerTask('validate', [ 'jshint', 'mochaTest' ]);  
  grunt.registerTask('build', [ 'clean', 'copy' ]);
  grunt.registerTask('run', [ 'watch' ]);
  
};
