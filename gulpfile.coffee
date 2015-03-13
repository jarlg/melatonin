gulp = require 'gulp'
gutil = require 'gulp-util'
browserify = require 'browserify'
source = require 'vinyl-source-stream'

static_files = [
    './src/popup.html'
    './src/popup.css'
    './src/options.html'
    './src/options.css'
]

coffee_source_files = [
    'main'
    'popup'
    'content_script'
    'options'
]

gulp.task 'coffee', ->
    for file in coffee_source_files
        do (file) ->
        browserify './src/' + file + '.coffee'
            .bundle()
            .on 'error', (e) ->
                gutil.log e.message
                @end()
            .pipe source file + '.js'
            .pipe gulp.dest './ext/'

gulp.task 'static', ->
    gulp.src static_files
        .pipe gulp.dest './ext/'

gulp.task 'watch', ['default'], ->
    gulp
        .watch './src/*.coffee', ['coffee']
        .on 'error', (e) -> gutil.log e.message
    gulp
        .watch static_files, ['static']
        .on 'error', (e) -> gutil.log e.message

gulp.task 'default', [ 'coffee', 'static' ]
