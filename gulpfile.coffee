gulp = require 'gulp'
coffeeify = require 'coffeeify'
browserify = require 'browserify'
source = require 'vinyl-source-stream'

static_files = [
    './src/index.html',
    './src/style.css'
]

gulp.task 'main', ->
    bundle = browserify './src/main.coffee'
        .bundle()
        .pipe source 'main.js'
        .pipe gulp.dest './ext/'

gulp.task 'app', ->
    bundle = browserify './src/app.coffee'
        .bundle()
        .pipe source 'app.js'
        .pipe gulp.dest './ext/'

gulp.task 'static', ->
    gulp.src static_files
        .pipe gulp.dest './ext/'

gulp.task 'default', [ 'app', 'main', 'static' ]
