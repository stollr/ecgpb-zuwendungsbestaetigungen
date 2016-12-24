var gulp = require('gulp');
var gutil = require('gulp-util');
var babel = require('gulp-babel');

//gulp.task("babel", function() {
gulp.task("default", function() {
    var babelInst = babel({
        plugins: ['transform-react-jsx']
    });
    babelInst.on('error', function(e) {
        gutil.log(e);
        babelInst.end();
    });

    return gulp.src("jsx/*.jsx")
        .pipe(babelInst)
        .pipe(gulp.dest("js/"));
});

gulp.task('watch', function() {
  gulp.watch('jsx/app.jsx', ['default']);
});