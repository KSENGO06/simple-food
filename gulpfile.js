const { src, dest, watch, series, parallel } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('autoprefixer');
const clean = require('gulp-clean');
const newer = require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const unzip = require('gulp-unzip');
const include = require('gulp-include');

function images() {
    const { default: avif } = require('gulp-avif');
    const { default: webp } = require('gulp-webp');
    const { default: imagemin } = require('gulp-imagemin');
    
    return src(['app/images/src/*.*', '!app/images/src/*.svg'])
        .pipe(newer('app/images/dist'))
        .pipe(avif({ quality: 50 }))
        .pipe(dest('app/images/dist'))
        .pipe(webp())
        .pipe(dest('app/images/dist'))
        .pipe(imagemin())
        .pipe(dest('app/images/dist'));
}

function fonts() {
    return src('app/fonts/src/*.*')
        .pipe(fonter({
            formats: ['woff', 'ttf']
        }))
        .pipe(dest('app/fonts/dist'))
        .pipe(ttf2woff2())
        .pipe(dest('app/fonts/dist'));
}

function unzipFonts() {
    return src('app/fonts/src/*.zip')
        .pipe(unzip())
        .pipe(dest('app/fonts/temp'));
}

function convertOtfToTtf() {
    return src('app/fonts/temp/*.otf')
        .pipe(fonter({ formats: ['ttf'] }))
        .pipe(dest('app/fonts/temp'));
}

function convertTtfToWoff() {
    return src('app/fonts/temp/*.ttf')
        .pipe(fonter({ formats: ['woff'] }))
        .pipe(dest('app/fonts/dist'));
}

function convertTtfToWoff2() {
    return src('app/fonts/temp/*.ttf')
        .pipe(ttf2woff2())
        .pipe(dest('app/fonts/dist'));
}

function cleanTempBefore() {
    return src('app/fonts/temp', { read: false, allowEmpty: true })
        .pipe(clean());
}

function cleanTempAfter() {
    return src('app/fonts/temp', { read: false, allowEmpty: true })
        .pipe(clean());
}

function pages() {
    return src('app/pages/*.html')
        .pipe(include({
            includePaths: 'app/components'
        }))
        .pipe(dest('app'))
        .pipe(browserSync.stream());
}

function svgSprites() {
    return src('app/images/dist/*.svg')
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: "../sprite.svg" // ім'я спрайту
                }
            },
        }))
        .pipe(dest('app/images/dist'));
}

function scripts() {
    return srcsrc([
        'node_modules/jquery/dist/jquery.min.js', 
        'app/js/main.js' 
    ])('app/js/main.js')
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream());
}

function styles() {
    return src('app/scss/style.scss')
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(autoprefixer({ cascade: false }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream());
}

function watching() {
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });

    watch(['app/scss/**/*.scss'], styles);
    watch(['app/js/main.js'], scripts);
    watch(['app/components/*', 'app/pages/*'], pages);
    watch(['app/*.html']).on('change', browserSync.reload);
}

function cleanDist() {
    return src('dist', { allowEmpty: true })
        .pipe(clean());
}

function building() {
    return src([
        'app/css/style.min.css',
        'app/images/dist/**/*',
        'app/js/main.min.js',
        'app/fonts/**/*',
        'app/**/*.html'
    ], { base: 'app' })
        .pipe(dest('dist'));
}

exports.images = images;
exports.fonts = series(
    cleanTempBefore,
    unzipFonts,
    convertOtfToTtf,
    parallel(convertTtfToWoff, convertTtfToWoff2),
    cleanTempAfter
);
exports.pages = pages;
exports.styles = styles;
exports.scripts = scripts;
exports.svgSprites = svgSprites;
exports.watching = watching;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist, building);
exports.default = parallel(styles, scripts, watching, fonts);
