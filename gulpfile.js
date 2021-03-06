var gulp = require('gulp');
var concat = require('gulp-concat');
var template = require('gulp-ng-templates');
var rename = require('gulp-rename');
var ngAnnotate = require('gulp-ng-annotate');
var uglify = require('gulp-uglify');
var gulp = require('gulp');
var git = require('gulp-git');
var bump = require('gulp-bump');
var filter = require('gulp-filter');
var tag_version = require('gulp-tag-version');
var cleanCSS = require('gulp-clean-css');

//Build Vars
var finalName = 'angular-tips';


gulp.task('default', ['build']);

// Then save the main provider in the same tmp dir
gulp.task('mkSrc', function() {
  return gulp.src('./src/*.js')
    // .pipe(concat('all.js'))
    .pipe(gulp.dest('./.tmp/'));
});

gulp.task('cleanCss', function () {
    gulp.src('./src/*.css')
        .pipe(concat(finalName +'.css'))
        .pipe(gulp.dest('./dist'))
        .pipe(cleanCSS())
        .pipe(rename({
		  extname: '.min.css'
		}))
        .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['mkSrc','cleanCss'], function() {
  return gulp.src('./.tmp/*.js')
    .pipe(ngAnnotate())
    .pipe(concat(finalName + ".js"))
    .pipe(gulp.dest('./dist'))
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('./dist'));
});