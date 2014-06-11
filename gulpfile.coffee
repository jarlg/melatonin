gulp = require 'gulp'
coffeeify = require 'coffeeify'
browserify = require 'browserify'
source = require 'vinyl-source-stream'

static_files = [
    './src/index.html',
    './src/style.css',
    './src/overlay.css'
]

coffee_source_files = [
    'main',
    'app',
    'content_script'
]

gulp.task 'main', ->
    for file in coffee_source_files
        do (file) ->
        browserify './src/' + file + '.coffee'
            .bundle()
            .pipe source file + '.js'
            .pipe gulp.dest './ext/'

gulp.task 'static', ->
    gulp.src static_files
        .pipe gulp.dest './ext/'

gulp.task 'default', [ 'main', 'static' ]
