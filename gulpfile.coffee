gulp = require 'gulp'
coffeeify = require 'coffeeify'
browserify = require 'browserify'
source = require 'vinyl-source-stream'

gulp.task 'scripts', ->
    bundle = browserify './src/test.coffee'
        .bundle()
        .pipe source 'app.js'
        .pipe gulp.dest './ext/'


gulp.task 'default', [ 'scripts' ]
