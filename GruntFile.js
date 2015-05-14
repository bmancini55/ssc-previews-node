
module.exports = function(grunt) {
  
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');  
  grunt.loadNpmTasks('grunt-express-runner');
  grunt.loadNpmTasks('grunt-contrib-watch');  
  
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
        files: 'src/src/**/*',
        tasks: [ 'expressrunner' ],
        options: {
          interrupt: true,
          atBegin: true
        }
      }
    }    
  });

  grunt.registerTask('validate', [ 'jshint', 'mochaTest' ]);  
  grunt.registerTask('run', [ 'watch' ]);
  
};
