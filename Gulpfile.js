//Gulpfile.js

// Common
var gulp = require('gulp');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var pump = require('pump');
var livereload = require('gulp-livereload');

// S/CSS
// var sass = require('gulp-sass');
var sass = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');

// JS
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

// Pug
var pug = require('gulp-pug');

// JSON
var data = require('gulp-data');
var fs = require('fs');
var path = require('path');
var merge = require('gulp-merge-json');

// Locations
var dirSass_In = 'src/less/**/*.less';
var dirCSS_Out = 'www/css/';

var dirJS_In = 'src/js/**/*.js';
var dirJS_Out = 'www/js/';

var dirPug_In = 'src/pug/**/!(_)*.pug'; // Prevents _includes
var dirHTML_Out = 'www/';

var dirJSON_In = 'src/pug/data/';
var dirJSON_Out = 'src/pug/'; // Doesn't need to be public because it's compiled.

// S/CSS task
gulp.task('styles', function(cb) {
  pump([
    gulp.src(dirSass_In),
    sass().on('error', sass.logError),
    autoprefixer('last 2 versions', 'safari >=8', 'ie >= 10', 'opera 12.1', 'ios 6', 'android 4'),
    gulp.dest(dirCSS_Out),
    rename({
      suffix: '.min'
    }),
    cssnano(),
    gulp.dest(dirCSS_Out)
  ], cb);
});

// JS
gulp.task('scripts', function(cb) {
  pump([
    gulp.src(dirJS_In),
    concat('scripts.js'),
    gulp.dest(dirJS_Out),
    rename({
      suffix: '.min'
    }),
    uglify(),
    gulp.dest(dirJS_Out)
  ], cb);
});

// Combine JSON data files
gulp.task('html:data', function(cb) {
  pump([
    gulp.src('src/pug/data/*.json'),
    merge({
      fileName: 'data.json'
    }, function(json, file) {
      var filename = path.basename(file.path),
        primaryKey = filename.replace(path.extname(filename), '');
      var data = {};
      data[primaryKey.toUpperCase()] = json;
      return data;
    }),
    gulp.dest('src/pug/')
  ], cb);
});

// Pug task
gulp.task('html', ['html:data'], function(cb) {
  pump([
    gulp.src(dirPug_In),
    data(function(file) {
      return JSON.parse(fs.readFileSync('src/pug/data.json'));
    }),
    pug({
      pretty: true
    }),
    gulp.dest(dirHTML_Out)
  ], cb);
});

// Build
gulp.task('build', function() {
  // Needs plugin
  runSequence('styles', 'scripts', 'html');
});

// Watch
gulp.task('default', function() {
  livereload.listen();
  //gulp.watch(dirSass_In, ['styles']);
  gulp.watch(dirJS_In, ['scripts']);
  gulp.watch(dirPug_In, ['html']);
  gulp.watch('src/pug/data.json', ['html']);
});
