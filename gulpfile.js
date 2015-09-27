var gulp = require('gulp'); 

var dust = require('gulp-dust');
var stylus = require('gulp-stylus');
var insert = require('gulp-insert');
var clean = require('gulp-clean');
var concat = require('gulp-concat');
var Filter = require('gulp-filter');
var rename = require('gulp-rename');

gulp.task('css', function () {
    var filter = Filter('**/*.styl');
    return gulp.src([
            './stylesheets/**.styl',
            './stylesheets/**.css'
        ])
        .pipe(filter)
        .pipe(stylus())
        //.pipe(filter.restore)
        .pipe(concat('out.css'))
        .pipe(gulp.dest('./stylesheets'));
});

gulp.task('dust', function() {
    return gulp.src('client/views/*.dust')
        .pipe(dust())
        .pipe(concat('templates.js'))
        .pipe(gulp.dest('./client/views'));
});

gulp.task('scripts', function() {
  gulp.src('all.js').pipe(clean());
  return gulp.src('./scripts/*.js')
      .pipe(concat('all.js'))
      .pipe(gulp.dest('./'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('stylesheets/*', ['css']);
    gulp.watch('scripts/*', ['scripts']);
//    gulp.watch('client/views/*.dust', ['dust']);
});

// Default Task
gulp.task('default', ['watch']);
