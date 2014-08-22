#
# helpers
#
$ = document.querySelector.bind document
$$ = document.querySelectorAll.bind document
val = (obj) -> obj.value
last = (arr) -> arr[arr.length-1] if arr.length > 0

M = require './models.coffee'

class Options
    constructor: (@parent, @models=[], @views=[]) ->
        chrome.storage.local
            .get 'keyframes', (item) =>
                @add kf for kf in item.keyframes

        $ '#add'
            .addEventListener 'click', (event) =>
                event.preventDefault()
                @add()
        
        $ '#save'
            .addEventListener 'click', (event) =>
                event.preventDefault()
                chrome.storage.local
                    .set 'keyframes': @models, ->

    add: (model) ->
        model = new M.Keyframe() if not model?
        @models.push model
        @views.push new M.KeyframeView model, @parent

        last @views
            .create()
            .render()
            .delete.addEventListener 'click', (event) =>
                event.preventDefault()
                index = @models.indexOf model
                @models.splice index, 1
                last @views.splice index, 1
                    .erase()


app = new Options $ '#keyframes'
