gulp = require 'gulp'
coffeeify = require 'coffeeify'
browserify = require 'browserify'

gulp.task 'scripts', ->
    bundle = browserify()
        .transform coffeeify()

    bundle.pipe (gulp.dest 'ext/')


gulp.task 'default', [ 'scripts' ]
