const gulp = require('gulp')
const path = require('path')
const babel = require('gulp-babel')

const root = path.resolve(__dirname)

gulp.src(path.resolve(root, 'es/**/*.js')).pipe(babel())
  .pipe(gulp.dest(path.resolve(root, 'cjs')))
