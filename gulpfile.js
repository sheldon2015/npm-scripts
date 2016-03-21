var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    minifycss = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    spritesmith = require('gulp.spritesmith'),
    //csso = require('gulp-csso'),
    //merge = require('merge-stream'),
    //pngquant = require('imagemin-pngquant'),  // 使用这个有问题
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    runSequence = require('run-sequence'),
    inject = require('gulp-inject-string'),
    replace = require('gulp-replace'); // 字符串替换插件


var pkg = require('./package.json');

var o = {
    spritePrefix: '.myicon-',
    spriteName: 'sprite'
}
var cf = {
    src: {
        file: {
            scss: ['src/scss/**/*.scss'],
            commCss: 'src/css/*.css',
            pageCss: 'src/css/*/*.css',
            js: 'src/js/**/*.js',
            img: ['src/img/**/*', '!src/img/myicon/*.*'],
            myicons: 'src/img/myicon/*.png',
            spriteImg: 'src/img/' + o.spriteName + '.png',
            spriteScss: 'src/scss/_' + o.spriteName + '.scss',
            font: 'src/font/*',
            html: 'src/html/**/*',
            vendor: 'src/vendor/**/*'
        },
        dir: {
            scss: 'src/scss/',
            css: 'src/css/',
            js: 'src/js/',
            img: 'src/img/',
            sprite: 'src/img/myicon/',
            font: 'src/font/'
        }
    },
    dist: {
        file: {
            css: 'dist/css/**/*.css'
        },
        dir: {
            root: 'dist',
            js: 'dist/js',
            css: 'dist/css',
            img: 'dist/img',
            font: 'dist/font',
            html: 'dist/html',
            vendor: 'dist/vendor'
        }
    },
    autoprefixerBrowsers: [
        'Android 2.3',
        'Android >= 4',
        'Chrome >= 20',
        'Firefox >= 24',
        'Explorer >= 8',
        'iOS >= 6',
        'Opera >= 12',
        'Safari >= 6'
    ]
};

gulp.task('sass', ['cleanCss'], function() {
    return sass(cf.src.file.scss, { sourcemap: true })
        .on('error', sass.logError)
        .pipe(autoprefixer({
            browsers: cf.autoprefixerBrowsers,
            cascade: false
        }))

        .pipe(sourcemaps.write())
        .pipe(sourcemaps.write('map', {
            includeContent: false,
            sourceRoot: 'scss'
        }))

        .pipe(gulp.dest(cf.src.dir.css))

        .pipe(minifycss({ compatibility: 'ie8' }))
        .pipe(rename({
            suffix: '.min',
            extname: '.css'
        }))


        .pipe(gulp.dest(cf.dist.dir.css));
});
gulp.task('sprite', function() {
    // Generate our spritesheet
    var spriteData = gulp.src(cf.src.file.myicons).pipe(spritesmith({
        imgName: '../img/' + o.spriteName + '.png',
        cssName: o.spriteName + '.css',
        cssOpts: {
            cssSelector: function(sprite) {
                return o.spritePrefix + sprite.name;  // 自定义className前缀
            }
        }
    }));
    //  output path for the sprite
    spriteData.img.pipe(gulp.dest(cf.src.dir.img));
    // output path for the CSS
    spriteData.css.pipe(rename({
        prefix: "_",
        extname: ".scss"
    })).pipe(gulp.dest(cf.src.dir.scss));
});



gulp.task('font', ['cleanFont'], function() {
    return gulp.src(cf.src.file.font)
        .pipe(gulp.dest(cf.dist.dir.font));
});

gulp.task('style', function() {
    runSequence('sprite', ['sass', 'font']);
});

// ==============================
// js
gulp.task('js', ['cleanJs'], function() {
    return gulp.src(cf.src.file.js)
        .pipe(jshint())
        .pipe(uglify())
        .pipe(gulp.dest(cf.dist.dir.js));
});

// ==============================
// 图片
gulp.task('img', ['cleanImg'], function() {
    return gulp.src(cf.src.file.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }]
        }))
        .pipe(gulp.dest(cf.dist.dir.img));
});

// ==============================
// html
gulp.task('html', ['cleanHtml'], function() {
    return gulp.src(cf.src.file.html)
        .pipe(replace('/src/', '/dist/'))
        .pipe(replace('.css', '.min.css'))
        .pipe(gulp.dest(cf.dist.dir.html));
});


// vendor
gulp.task('vendor', ['cleanVendor'], function() {
    return gulp.src(cf.src.file.vendor)
        .pipe(gulp.dest(cf.dist.dir.vendor));
});

// ==============================
// 清理
gulp.task('clean', function() {
    return gulp.src(cf.dist.dir.root, { read: false })
        .pipe(clean());
});
gulp.task('cleanCss', function() {
    return gulp.src([cf.dist.dir.css, cf.src.dir.css], { read: false })
        .pipe(clean());
});
gulp.task('cleanFont', function() {
    return gulp.src([cf.dist.dir.font], { read: false })
        .pipe(clean());
});
//gulp.task('cleanSprite', function() {
//    return gulp.src([cf.src.file.spriteImg], {read: false})
//        .pipe(clean());
//});
gulp.task('cleanJs', function() {
    return gulp.src(cf.dist.dir.js, { read: false })
        .pipe(clean());
});
gulp.task('cleanImg', function() {
    return gulp.src(cf.dist.dir.img, { read: false })
        .pipe(clean());
});
gulp.task('cleanHtml', function() {
    return gulp.src(cf.dist.dir.html, { read: false })
        .pipe(clean());
});
gulp.task('cleanVendor', function() {
    return gulp.src(cf.dist.dir.vendor, { read: false })
        .pipe(clean());
});

// ==============================
// watch
gulp.task('watch', function() {
    // watch scss
    gulp.watch(cf.src.file.scss, ['sass']);

    // watch font
    gulp.watch(cf.src.file.font, ['font']);

    // watch sprite
    gulp.watch(cf.src.file.myicons, ['sprite']);

    // watch img
    gulp.watch(cf.src.file.img, ['img']);

    // watch js
    gulp.watch(cf.src.file.js, ['js']);

    // watch html
    gulp.watch(cf.src.file.html, ['html']);

    // watch vendor
    gulp.watch(cf.src.file.vendor, ['vendor']);
});


// 预设任务
gulp.task('default', ['clean'], function() {
    runSequence('style', 'img', ['vendor', 'js', 'html']);
});


// ==================================
// test
// html
//gulp.task('testHtml', function () {
//    return gulp.src(cf.src.file.html)
//
//        .pipe(inject.before('</head>', '<script src="http://localhost:35729/livereload.js"></script>'))
//        .pipe(gulp.dest(cf.dist.dir.html))
//        .pipe(livereload());
//});
//
//// 监听
//gulp.task('testWatch', function() {
//    // 启动服务器
//    livereload.listen();
//
//    gulp.watch('./html/*.html', ['html']);

});
// ==================================