module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-aws-s3');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
      server: {
        port: 3000,
        base: '.'
      }
    },
    uglify: {
      app: {
        options: {
          banner: '/*! <%= pkg.name %> v<%= pkg.version %> */'
        },
        files: {
          'build/app.min.js': ['build/templates.js', 'build/app.js']
        }
      },
      vendor: {
        options: {},
        files: {
          'build/vendor.js': [
            'bower_components/d3/d3.js',
            'bower_components/d3-plugins/sankey/sankey.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-route/angular-route.js',
            'bower_components/angular-scroll/angular-scroll.js',
            'bower_components/angular-cookies/angular-cookies.js',
            'bower_components/angular-ui-select/dist/select.js',
            'bower_components/angular-filter/dist/angular-filter.js',
            'bower_components/ng-file-upload/ng-file-upload-all.js',
            'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
            'bower_components/babbage.ui/dist/babbage.ui.js'
          ]
        }
      }
    },
    concat: {
      options: {
        stripBanners: true,
        separator: ';'
      },
      dist: {
        src: ['src/app.js', 'src/**/*.js'],
        dest: 'build/app.js'
      },
    },
    html2js: {
      dist: {
        options: {
          base: 'templates/',
          module: 'spendb.templates',
          htmlmin: {
            collapseWhitespace: true,
            removeComments: true
          }
        },
        src: ['templates/**/*.html'],
        dest: 'build/templates.js'
      }
    },
    less: {
      app: {
        options: {
          paths: ["less"],
          strictImports: true
        },
        files: {
          "build/style.css": ["style/base.less"]
        }
      }
    },
    aws_s3: {
      assets: {
        options: {
          bucket: '<%= pkg.deployBucket %>',
          region: 'eu-west-1',
          uploadConcurrency: 5
        },
        files: [
          {expand: true, cwd: '.', src: ['build/**', 'src/**', '*.html'], dest: '/<%= pkg.deployBase %>/<%= pkg.version %>'},
        ]
      }
    },
    watch: {
      templates: {
        files: ['templates/**/*.html'],
        tasks: ['html2js']
      },
      js: {
        files: ['src/**/*.js'],
        tasks: ['concat', 'uglify:app']
      },
      style: {
        files: ['style/**/*.less'],
        tasks: ['less']
      },
    }
  });

  grunt.registerTask('default', ['less', 'html2js', 'concat', 'uglify']);
  grunt.registerTask('deploy', ['aws_s3']);
  grunt.registerTask('server', ['connect', 'watch'])
};
