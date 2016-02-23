var gulp = require('gulp'),
    sass = require('gulp-sass'),
    lessPluginCleanCSS = require('less-plugin-clean-css'),
    cleancss = new lessPluginCleanCSS({advanced: true}),
    autoprefixer = require('gulp-autoprefixer'),
    // minifycss = require('gulp-minify-css'),
    minifycss = require('gulp-cssnano'),
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
    sourcemaps = require('gulp-sourcemaps');


// gulp gulp-sass less-plugin-clean-css gulp-autoprefixer gulp-minify-css gulp-jshint jshint-stylish gulp-uglify gulp-usemin gulp-imagemin gulp-cache gulp-rev del gulp-typescript gulp-sourcemaps
// watch
gulp.task('watch', function () {
   gulp.watch('src/scripts/app.ts', ['compileTs']);
   gulp.watch('src/styles/*.sass', ['styles']);
   gulp.watch('src/scripts/*.js', ['jshint']);
});
   
// styles
gulp.task('styles', function () {
    console.log('watch');
	gulp.src('src/styles/*.less')
		.pipe(sass({plugins: [cleancss]}).on('error', function (err) {
			console.dir(err);
		}))
		.pipe(autoprefixer({browsers: ['last 2 versions']}))
		.pipe(gulp.dest('src/styles'));		
}); 

// compileTS
gulp.task('compileTs', function () {
    var tsResult = gulp.src('src/scripts/app.ts')
    .pipe(sourcemaps.init())
    .pipe(ts({
        target: 'ES5',
        declarationFiles: false,
        noExternalResolve: true,
        removeComments: false,
    }));
		
	tsResult.dts.pipe(gulp.dest('src/scripts'));
	return tsResult.js
				.pipe(sourcemaps.write('/maps'))
				.pipe(gulp.dest('src/scripts'));
});

// jshint
gulp.task('jshint', function () {
    return gulp.src(['src/scripts/app.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

// clean for production
gulp.task('clean', function () {
   return del(['build']); 
});

// copy desktop version
gulp.task('copy', ['clean'], function () {
    gulp.src('src/index.html')
        .pipe(processhtml())
        .pipe(gulp.dest('build/'));
})

// images desktop
gulp.task('imagemin', function () {
   del(['build/images'])
   return gulp.src('src/images/*')
        .pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
        .pipe(gulp.dest('build/images')); 
});

// minimize & uglify
gulp.task('usemin', ['jshint'], function () {
    gulp.src('src/scripts/*.js')
            .pipe(uglify())
            .pipe(rename(function (path) {
                path.basename += '.min';
            }))
            .pipe(gulp.dest('build/scripts'));
    gulp.src('src/styles/*.css')
            .pipe(gulp.dest('build/styles'));
});

// build
gulp.task('build', ['clean'], function () {
    gulp.start('usemin', 'imagemin', 'copy');
});
