/* jshint node:true */
'use strict';
// generated on 2014-11-28 using generator-gulp-webapp 0.2.0
var gulp = require('gulp');
var gutil = require('gulp-util');
var config = require('./config.json');
var $ = require('gulp-load-plugins')();

gulp.task('styles', function () {
    return gulp.src('./app/styles/main.scss')
        .pipe($.rubySass({
          style: 'expanded',
          precision: 10
        }))
        .on('error', function (err) { console.error('Error!', err.message); })
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js')
    .pipe($.wrap('(function(){\n\'use strict\';\n<%= contents %>\n})();'))
    // the next line moves the jshint comments up top. I baked this plugin myself :)
    .pipe($.regexShuffler(/["|']use strict["|'];[\n\s]*((?:\/\*[\s\S]*\*\/)[\n\s]*)[^\/]/g /* moves captureGroup 1... */,
            /^/g /* ...after here */, {captureGroup: 1}))
    .pipe($.jshint({lookup: 'app/scripts/.jshintrc'}))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

//
gulp.task('html', ['styles'], function () {
  var lazypipe = require('lazypipe');
  // prepare the pipe to be used by the css asset userefs
  var cssChannel = lazypipe()
    .pipe($.csso)
    .pipe($.replace, 'bower_components/bootstrap-sass-official/assets/fonts/bootstrap','fonts');
  // looks for assests in markup blocks and returns the blocks to the assets variable.
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});


  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', cssChannel()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')().concat('app/fonts/**/*'))
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function () {
  return gulp.src([
    'app/*.*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist']));

gulp.task('connect', ['styles'], function () {
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var app = require('connect')()
    .use(require('connect-livereload')({port: 35729}))
    .use(serveStatic('.tmp'))
    .use(serveStatic('app'))
    // paths to bower_components should be relative to the current file
    // e.g. in app/index.html you should use ../bower_components
    .use('/bower_components', serveStatic('bower_components'))
    .use(serveIndex('app'));

  require('http').createServer(app)
    .listen(9000)
    .on('listening', function () {
      console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('serve', ['connect', 'watch'], function () {
  require('opn')('http://localhost:9000');
});

gulp.task('templates', function() {
  return gulp.src('app/templates/**/*.{hbs,handlebars}')
    .pipe($.emberTemplates())
    .pipe($.concat('ember-templates.js'))
    .pipe(gulp.dest('.tmp/scripts'));
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.scss')
    .pipe(wiredep())
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({exclude: ['bootstrap-sass-official']}))
    .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect'], function () {
  $.livereload.listen();

  // watch for changes
  gulp.watch([
    'app/*.html',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', $.livereload.changed);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch('bower.json', ['wiredep']);
  gulp.watch('app/templates/**/*.{hbs,handlebars}', ['templates']);
});

gulp.task('build', ['jshint', 'html', 'images', 'fonts', 'extras', 'templates'], function () {
  return gulp.src('dist/**/*')
     .pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('deploy', ['clean'], function(){
    gulp.start('moreDeploy');
})

gulp.task('moreDeploy', ['styles', 'html', 'images', 'fonts', 'extras', 'templates'], function() {
    return gulp.src('./dist/**/*.*')
      .pipe($.debug())
      .pipe($.ftp({
          "host": config.ftp.host,
          "user": config.ftp.username,
          "pass": config.ftp.password,
          "remotePath": config.ftp.remotePath,
          "verbose" : true
      }))
      .on('error', function(err) {
        console.log(err.message);
      })
      .pipe($.notify('deployed!'));
});
