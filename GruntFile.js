
module.exports = function(grunt) {
  
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');  
  grunt.loadNpmTasks('grunt-express-runner');
  grunt.loadNpmTasks('grunt-contrib-watch'); 
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean'); 
  grunt.loadNpmTasks('grunt-babel');
  
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
        script: 'dist/server.js',
        debug: 'previews*'
      }
    },
    watch: {
      server: { 
        files: 'src/**/*',
        tasks: [ 'build', 'expressrunner' ],
        options: {
          interrupt: true,
          atBegin: true
        }
      }
    },
    clean: {
      lib: [ 'dist' ]
    },
    copy: {      
      lib: {
        files: [{
          expand: true,
          cwd: 'bower_components/bootstrap/dist',
          src: '**/*',                       
          dest: 'dist/public/lib/bootstrap'
        }, {
          expand: true,
          cwd: 'bower_components/jquery/dist',
          src: '**/*',
          dest: 'dist/public/lib/jquery'
        }]
      },
      client: {
        files: [{
          expand: true,
          cwd: 'src/client',
          src: '**/*',
          dest: 'dist/public'
        }]
      },
      server: {
        files: [{
          expand: true,
          cwd: 'src/server',
          src: '**/*.hbs',
          dest: 'dist'
        }]
      }
    },
    babel: {
      options: {        
        'optional': [ 'es7.asyncFunctions' ]
      },
      server: {
        files: [{
          expand: true,
          cwd: 'src/server',
          src: '**/*.js',
          dest: 'dist'
        }]
      }
    }
  });

  grunt.registerTask('validate', [ 'jshint', 'mochaTest' ]);  
  grunt.registerTask('build', [ 'clean', 'copy', 'babel' ]);
  grunt.registerTask('run', [ 'watch' ]);
  
};
