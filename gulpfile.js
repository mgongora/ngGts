var gulp = require('gulp');
var karma = require('karma').server;
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var path = require('path');
var plumber = require('gulp-plumber');
var runSequence = require('run-sequence');
var jshint = require('gulp-jshint');
var templateCache = require('gulp-angular-templatecache');
var minifyHTML = require('gulp-minify-html');


/**
 * File patterns
 **/

// Root directory
var rootDirectory = path.resolve('./');

// Source directory for build process
var sourceDirectory = path.join(rootDirectory, './modules');

var templateFiles = [

  // add all template files
  path.join(sourceDirectory, '/**/*.html')

];

var sourceFiles = [

  // Make sure module files are handled first
  path.join(sourceDirectory, '/**/*.module.js'),

  // Then add all JavaScript files
  path.join(sourceDirectory, '/**/*.js'),


];

var lintFiles = [
  'gulpfile.js',
  // Karma configuration
  'karma-*.conf.js'
].concat(sourceFiles);

gulp.task('build', function() {
  gulp.src(sourceFiles)
    .pipe(plumber())
    .pipe(concat('nggts.js'))
    .pipe(gulp.dest('./temp/'));
});

gulp.task('dist', function(){
  return gulp.src('./temp/*.js')
      .pipe(concat('nggts.js'))
      .pipe(gulp.dest('./dist'))
      .pipe(uglify())
      .pipe(rename('nggts.min.js'))
      .pipe(gulp.dest('./dist'));
});

gulp.task('minify-templates', function() {
  var opts = {
    empty:true
  };

  return gulp.src(templateFiles)
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('./temp'));
});
gulp.task('build-templates', function() {
  gulp.src('./temp/**/*.html')
    .pipe(plumber())
    .pipe(templateCache('templates.js', {module:'nggts.templates'}))
    .pipe(gulp.dest('./temp'));
});

//gulp.task('build-templates', function() {
//  gulp.src(templateFiles)
//    .pipe(plumber())
//    .pipe(templateCache('templates.js', {module:'nggts.templates'}))
//    .pipe(gulp.dest('./temp'));
//});


/**
 * Process
 */
gulp.task('process-all', function (done) {
  runSequence('jshint', 'test-src', 'build', 'minify-templates', 'build-templates' ,'dist', done);
});

/**
 * Watch task
 */
gulp.task('watch', function () {

  // Watch JavaScript files
  gulp.watch(sourceFiles, ['process-all']);
  gulp.watch(templateFiles, ['process-all']);
});

/**
 * Validate source JavaScript
 */
gulp.task('jshint', function () {
  return gulp.src(lintFiles)
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

/**
 * Run test once and exit
 */
gulp.task('test-src', function (done) {
  karma.start({
    configFile: __dirname + '/karma-src.conf.js',
    singleRun: true
  }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-concatenated', function (done) {
  karma.start({
    configFile: __dirname + '/karma-dist-concatenated.conf.js',
    singleRun: true
  }, done);
});

/**
 * Run test once and exit
 */
gulp.task('test-dist-minified', function (done) {
  karma.start({
    configFile: __dirname + '/karma-dist-minified.conf.js',
    singleRun: true
  }, done);
});

gulp.task('default', function () {
  runSequence('process-all', 'watch');
});
