// Karma configuration
// Generated on Mon Jun 22 2015 10:34:42 GMT+0200 (CEST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha','chai', 'sinon-chai'],


    // list of files / patterns to load in the browser
    files: [
      'bower_components/d3/d3.js',
      'bower_components/d3-plugins/sankey/sankey.js',
      'bower_components/vega-lite/vega-lite.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-scroll/angular-scroll.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-ui-select/dist/select.js',
      'bower_components/angular-filter/dist/angular-filter.js',
      'bower_components/ng-file-upload/ng-file-upload-shim.js',
      'bower_components/ng-file-upload/ng-file-upload.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'bower_components/babbage.ui/dist/babbage.ui.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'tests/js/helper.js',
      'src/app.js',
      'src/**/*.js',
      '**/*.html',
      'tests/js/**/*Spec.js'
    ],

    // list of files to exclude
    exclude: [
      '**/*.swp'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
       'templates/**/*.html': ['ng-html2js']
    },

    ngHtml2JsPreprocessor: {
      moduleName: 'spendb.templates'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
