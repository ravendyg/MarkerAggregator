var gulp = require('gulp'),
    less = require('gulp-less'),
    lessPluginCleanCSS = require('less-plugin-clean-css'),
    cleancss = new lessPluginCleanCSS({advanced: true}),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    // // eslint = require('gulp-eslint'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    rename = require("gulp-rename"),
    processhtml = require('gulp-processhtml'),
    usemin = require('gulp-usemin'),
    imagemin = require('gulp-imagemin'),
    // // rename = require('gulp-rename'),
    // concat = require('gulp-concat'),
    // notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    // // changed = require('gulp-changed'),
    rev = require('gulp-rev'),
    // // browserSync = require('browser-sync'),
    del = require('del'),
    // exec = require('gulp-exec'),
    ts = require('gulp-typescript'),
    sourcemaps = require('gulp-sourcemaps'),
    mocha = require(`gulp-mocha`);


// gulp gulp-sass less-plugin-clean-css gulp-autoprefixer gulp-minify-css gulp-jshint jshint-stylish gulp-uglify gulp-usemin gulp-imagemin gulp-cache gulp-rev del gulp-typescript gulp-sourcemaps
gulp.task(`default`, [`watch`]);
// watch
gulp.task('watch', function () {
//    gulp.watch('src/scripts/app.ts', ['compileTs']);
   gulp.watch('src/styles/*.less', ['styles']);
   gulp.watch('build/scripts/*.js', ['moveTest']);
});

// build
gulp.task('build', ['clean'], function () {
    gulp.start('usemin', 'imagemin');
});




   
// styles
gulp.task('styles', function () {
	gulp.src('src/styles/*.less')
		.pipe(less({plugins: [cleancss]}).on('error', function (err) {
			console.dir(err);
		}))
		.pipe(autoprefixer({browsers: ['last 2 versions']}))
		.pipe(gulp.dest('build/styles'));		
}); 

// remove test from build
gulp.task(`cleanTest`, [`moveTest`], function () {
    return del('build/scripts/test*');
});
// copy test into separate directory
gulp.task(`moveTest`, function () {
   return gulp.src('build/scripts/test*.js')
        .pipe(gulp.dest(`tests`));
});


// images desktop
gulp.task('imagemin', function () {
   del(['build/images'])
   return gulp.src('src/images/*')
        .pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
        .pipe(gulp.dest('build/images')); 
});

// minimize & uglify
gulp.task('usemin', function () {
    return gulp.src('src/index.html')
            .pipe(usemin({
                js: [uglify()]
            }))
            .pipe(gulp.dest('build/'));
});

gulp.task(`clean`, function () {
    del(['build/index.html']);
    return del(['build/scripts/vendor.js']); 
});


