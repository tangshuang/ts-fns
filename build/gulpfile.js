const gulp = require('gulp')
const path = require('path')
const babel = require('gulp-babel')

gulp.src(__dirname + '/../src/*.js').pipe(babel({
  presets: [
    '@babel/env'
  ],
})).pipe(gulp.dest(__dirname + '/..'))
