gulp = require 'gulp'
browserify = require 'browserify'
source = require 'vinyl-source-stream'

static_files = [
    './src/index.html'
    './src/style.css'
    './src/options.html'
    './src/options.css'
]

coffee_source_files = [
    'main'
    'popup'
    'content_script'
    'options'
    'test'
]

errorHandler = (err) ->
    console.log err.stack or err
    @end()

gulp.task 'coffee', ->
    for file in coffee_source_files
        do (file) ->
        browserify './src/' + file + '.coffee'
            .bundle()
            .pipe source file + '.js'
            .pipe gulp.dest './ext/'

gulp.task 'static', ->
    gulp.src static_files
        .pipe gulp.dest './ext/'

gulp.task 'watch', ['default'], ->
    gulp
        .watch './src/*.coffee', ['coffee']
        .on 'error', errorHandler
    gulp
        .watch static_files, ['static']
        .on 'error', errorHandler

gulp.task 'default', [ 'coffee', 'static' ]
