/*************************
  Imports
*************************/
import gulp from 'gulp';
import babel from 'gulp-babel';
import jade from 'gulp-jade';
import uglify from 'gulp-uglify';
import concat from 'gulp-concat';
import less from 'gulp-less';
import gls from 'gulp-live-server';
import cssMinify from 'gulp-minify-css';
import prefix from 'gulp-autoprefixer';
import rename from 'gulp-rename';
import jsdoc from 'gulp-jsdoc';
import eslint from 'gulp-eslint';
import wrapper from 'gulp-wrapper';
import sourcemaps from 'gulp-sourcemaps';
import svgstore from 'gulp-svgstore';
import svgmin from 'gulp-svgmin';
import combiner from 'stream-combiner2';
import path from 'path';
import winston from 'winston';
import fs from 'fs';
import glob from 'glob';
import pageData from './_helpers/pageData';

/*************************
  Import our config object
  so we can use our paths.
*************************/
const PATHS = require('./config.json').paths;

/*************************
  Set our log directory
*************************/
const logDirectory = path.join(__dirname, PATHS.logs);

// make sure our logs directory exits, if not, create it.
if (!fs.existsSync(logDirectory)) { fs.mkdirSync(logDirectory); }

// Instantiate our logger
winston.add(winston.transports.DailyRotateFile, {filename: path.join(logDirectory, 'gulp.log')});

/*************************
  Build commands
*************************/

// build task
gulp.task('build', ['jade', 'styles', 'styleguide', 'es6-babel', 'javascript', 'svg']);

// serve task
gulp.task('serve', ['build', 'watch', 'server']);

// javascript task
gulp.task('javascript', ['js-global', 'js-components', 'js-libraries', 'js-jsdoc', 'js-maps']);

// jade task to build out jade template to static HTML files.
gulp.task('jade', () => {
  // get glob of pages
  glob(path.join(__dirname, PATHS.pages), {}, (err, pages) => {
    if (err) winston.error(err);

    // for each page
    pages.forEach((page) => {
      const data = pageData(path.join(__dirname, PATHS.data), path.join(__dirname, PATHS.compData));
      gulp.src(page)
        .pipe(jade({
          locals: data,
          pretty: true,
        }))
        .pipe(gulp.dest(path.join(__dirname, PATHS.public)));
    });
  });

  return;
});

// styles task to build out our LESS files into a stylesheet.
gulp.task('styles', () => {
  const globalCSS = PATHS.cssLibraries.map((filePath) => {
    return path.join(__dirname, filePath);
  });

  const cssArray = [...globalCSS, path.join(__dirname, PATHS.styles, 'main.less')];

  return gulp.src(cssArray)
    .pipe(less())
    .pipe(concat('stylesheet.css'))
    .pipe(prefix({
      browsers: ['last 2 versions'],
      cascade: 'false',
    }))
    .pipe(gulp.dest(path.join(__dirname, PATHS.public, 'css/')))
    .pipe(cssMinify())
    .pipe(rename('stylesheet.min.css'))
    .pipe(gulp.dest(path.join(__dirname, PATHS.public, 'css/')));
});

// styleguide builds out the items for the styleguide.
gulp.task('styleguide', () => {
  // build pages
  gulp.src(path.join(__dirname, PATHS.styleguide.pages))
    .pipe(jade({
      pretty: true,
    }))
    .pipe(gulp.dest(path.join(__dirname, PATHS.public)));

  // build styles
  return gulp.src(path.join(__dirname, PATHS.styleguide.styles))
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(sourcemaps.write())
    .pipe(rename('styleguide.css'))
    .pipe(gulp.dest(path.join(__dirname, PATHS.public, 'css')));
});

// js-global task to combine our JS files
gulp.task('js-global', () => {
  const combined = combiner.obj([
    gulp.src(path.join(__dirname, PATHS.javascript, '*.js')),
    eslint(),
    wrapper({
      header: '\n/* \n ${filename} \n */ \n',
      footer: '\n/* \n END ${filename} \n */ \n',
    }),
    sourcemaps.init(),
    concat('main.js'),
    gulp.dest(path.join(__dirname, PATHS.public, 'js/')),
    uglify({
      mangle: false,
      compress: true,
    }),
    rename('main.min.js'),
    gulp.dest(path.join(__dirname, PATHS.public, 'js/')),
  ]);

  combined.on('error', (err) => {
    winston.error(err);
  });

  return combined;
});

// js-libraires task to combine our JS libs
gulp.task('js-libraries', () => {
  const libs = PATHS.jsLibraries.map((filePath) => {
    return path.join(__dirname, filePath);
  });

  const combined = combiner.obj([
    gulp.src(libs),
    eslint(),
    wrapper({
      header: '\n/* \n ${filename} \n */ \n',
      footer: '\n/* \n END ${filename} \n */ \n',
    }),
    sourcemaps.init(),
    concat('libs.min.js'),
    gulp.dest(path.join(__dirname, PATHS.public, 'js/')),
  ]);

  combined.on('error', (err) => {
    winston.error(err);
  });

  return combined;
});

// js-components task
gulp.task('js-components', () => {
  const combined = combiner.obj([
    gulp.src(path.join(__dirname, PATHS.components, '**/javascript/*.js')),
    eslint(),
    wrapper({
      header: '/* \n ${filename} \n */ \n',
      footer: '/* \n END ${filename} \n */ \n',
    }),
    sourcemaps.init(),
    concat('main.js'),
    gulp.dest(path.join(__dirname, PATHS.public, 'js/')),
    uglify({
      mangle: false,
      compress: true,
    }),
    rename('main.min.js'),
    gulp.dest(path.join(__dirname, PATHS.public, 'js/')),
  ]);

  combined.on('error', (err) => {
    winston.error(err);
  });

  return combined;
});

// js-jsdoc task
gulp.task('js-jsdoc', () => {
  return gulp.src(path.join(__dirname, PATHS.components, '**/javascript/*.js'))
    .pipe(jsdoc(path.join(__dirname, PATHS.public, 'jsdocs/')));
});

// js-maps task
gulp.task('js-maps', () => {
  const maps = PATHS.jsMaps.map((filePath) => {
    return path.join(__dirname, filePath);
  });

  return gulp.src(maps)
    .pipe(gulp.dest(path.join(__dirname, PATHS.public, 'js')));
});

// server task
gulp.task('server', ['es6-babel'], () => {
  const server = gls.new(['--harmony', 'index.js']);
  server.start();
});

// svg task
gulp.task('svg', () => {
  return gulp.src(path.join(__dirname, PATHS.svg, '**.svg'))
    .pipe(svgmin())
    .pipe(svgstore())
    .pipe(gulp.dest(path.join(__dirname, PATHS.public, 'assets/')));
});

// es6 babel
gulp.task('es6-babel', () => {
  return gulp.src(path.join(__dirname, '/index.babel.js'))
    .pipe(babel())
    .pipe(rename('index.js'))
    .pipe(gulp.dest(path.join(__dirname, '/')));
});

// watch
gulp.task('watch', () => {
  gulp.watch([
    path.join(__dirname, PATHS.styles, '**.less'),
    path.join(__dirname, PATHS.styles, '**/**.less'),
    path.join(__dirname, PATHS.components, '**/less/**.less'),
  ], ['styles']);
  gulp.watch([
    path.join(__dirname, PATHS.pages),
    path.join(__dirname, '/pages/**/*.jade'),
    path.join(__dirname, PATHS.components + '**/markup/**.jade'),
    path.join(__dirname, PATHS.compData),
    path.join(__dirname, PATHS.data),
  ], ['jade']);
});
