var gulp = require('gulp');
var webpack = require('webpack-stream');
var merge = require('merge2');
var rev = require('gulp-rev');
var revReplace = require("gulp-rev-replace");
var clean = require('gulp-clean');
var sourcemaps = require('gulp-sourcemaps');
var argv = require('yargs').argv;
var fs = require('fs');

gulp.task('drop-cache', function () {
    return gulp.src(['./src/main/resources/public/dist'], {read: false})
        .pipe(clean());
});

gulp.task('copy-files', ['drop-cache'], () => {
    var html = gulp.src('./node_modules/entcore/src/template/**/*.html')
        .pipe(gulp.dest('./src/main/resources/public/template/entcore'));
    var bundle = gulp.src('./node_modules/entcore/bundle/*')
        .pipe(gulp.dest('./src/main/resources/public/dist/entcore'));

    return merge(html, bundle);
})

gulp.task('copy-mdi-font', ['copy-files'], () => {
    var streams = [];
    streams
        .push(gulp.src('./node_modules/@mdi/font/fonts/*')
        .pipe(gulp.dest('./src/main/resources/public/mdi')))
    return merge(streams);
});

gulp.task('webpack', ['copy-mdi-font'], () => {
    var streams = [];
        streams.push(gulp.src('./src/main/resources/public/**/*.ts')
            .pipe(webpack(require('./webpack.config.js')))
            .on('error', function handleError() {
                this.emit('end'); // Recover from errors
            })
            .pipe(gulp.dest('./src/main/resources/public/dist')))
    return merge(streams);
});

gulp.task('rev', ['webpack'], () => {
    return gulp.src('./src/main/resources/public/dist/**/*.js')
        .pipe(rev())
        .pipe(gulp.dest('./src/main/resources/public/dist'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./'));
});

gulp.task('build', ['rev'], () => {
    var refs = gulp.src("./src/main/resources/view-src/**/*.html")
        .pipe(revReplace({manifest: gulp.src("./rev-manifest.json")}))
        .pipe(gulp.dest("./src/main/resources/view"));

    var copyBehaviours = gulp.src('./src/main/resources/public/dist/behaviours.js')
        .pipe(gulp.dest('./src/main/resources/public/js'));

    return merge[refs, copyBehaviours];
});

function getModName(fileContent) {
    var getProp = function (prop) {
        return fileContent.split(prop + '=')[1].split(/\\r?\\n/)[0];
    }
    return getProp('modowner') + '~' + getProp('modname') + '~' + getProp('version');
}

gulp.task('watch', () => {
    var springboard = argv.springboard;
    if (!springboard) {
        springboard = '../springboard-open-ent/';
    }
    if (springboard[springboard.length - 1] !== '/') {
        springboard += '/';
    }

    gulp.watch('./src/main/resources/public/ts/**/*.ts', () => gulp.start('build'));

    fs.readFile("./gradle.properties", "utf8", function (error, content) {
        var modName = getModName(content);
        gulp.watch(['./src/main/resources/public/template/**/*.html', '!./src/main/resources/public/template/entcore/*.html'], () => {
            console.log('Copying resources to ' + springboard + 'mods/' + modName);
            gulp.src('./src/main/resources/**/*')
                .pipe(gulp.dest(springboard + 'mods/' + modName));
        });

        gulp.watch('./src/main/resources/view/**/*.html', () => {
            console.log('Copying resources to ' + springboard + 'mods/' + modName);
            gulp.src('./src/main/resources/**/*')
                .pipe(gulp.dest(springboard + 'mods/' + modName));
        });
    });
});