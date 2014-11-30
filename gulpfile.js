/* jshint node:true */
'use strict';
// generated on 2014-11-28 using generator-gulp-webapp 0.2.0
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('styles', function () {
  return gulp.src('app/styles/main.scss')
    .pipe($.plumber())
    .pipe($.rubySass({
      style: 'expanded',
      precision: 10
    }))
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('prepare-scripts', function() {
  gulp.src(['app/scripts/app.js','app/scripts/**/!(concat-scripts)*.js'])
    .pipe($.wrap('(function(){\n"use strict";\n<%= contents %>\n})();'))
    .pipe($.concat('concat-scripts.js'))
    .pipe(gulp.dest('app/scripts'));
});

gulp.task('jshint', ['prepare-scripts'], function () {
  return gulp.src('app/scripts/app-scripts.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('minuglify', ['prepare-scripts'], function() {
  return gulp.src('app/scripts/app-scripts.js')
    .pipe($.uglify())
    .pipe($.rename('app-scripts.min.js'))
    .pipe(gulp.dest('dist/scripts'));
});

//
gulp.task('html', ['styles', 'prepare-scripts'], function () {
  var lazypipe = require('lazypipe');
  // prepare the pipe to be used by the css asset userefs
  var cssChannel = lazypipe()
    .pipe($.csso)
    .pipe($.replace, 'bower_components/bootstrap-sass-official/assets/fonts/bootstrap','fonts');
  // looks for assests in markup blocks and returns the blocks to the assets variable.
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});


  return gulp.src('app/*.html')
    .pipe($.notify('from debug'))
    .pipe($.print())
    .pipe($.debug({verbose: true}))
    .pipe(assets)
    .pipe($.notify('from assets'))
    .pipe($.print())
    .pipe($.if('*.js', function() {
      $.notify('in if js');
      return $.uglify();
      }()))
    .pipe($.notify('from if js: uglify'))
    .pipe($.print())
    .pipe($.if('*.css', cssChannel()))
    .pipe($.notify('from if css: cssChannel'))
    .pipe($.print())
    .pipe(assets.restore())
    .pipe($.notify('from assets.restore'))
    .pipe($.print())
    .pipe($.useref())
    .pipe($.notify('from useref'))
    .pipe($.print())
    .pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe($.notify('from if html: minifyHtml'))
    .pipe($.print())
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
  gulp.src('app/templates/**/*.{hbs,handlebars}')
    .pipe($.emberTemplates())
    .pipe($.concat('ember-templates.js'))
    .pipe(gulp.dest('dist/js'));
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
});

gulp.task('build', ['jshint', 'html', 'images', 'fonts', 'extras', 'minuglify'], function () {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
