#
# helpers
#
$ = document.querySelector.bind document
$$ = document.querySelectorAll.bind document
val = (obj) -> obj.value
last = (arr) -> arr[arr.length-1] if arr.length > 0

M = require './models.coffee'
S = require './sun_altitude.coffee'

class Options
    constructor: (@parent, @models=[], @views=[]) ->
        @prio =
            temperature: 2,
            color: 1,
            opacity: 0

        chrome.storage.local
            .get ['keyframes', 'latitude', 'longitude'], (items) =>
                # sort by option first, key_value for same option
                items.keyframes
                    .sort (a, b) =>
                        if a.option isnt b.option
                            @prio[b.option] - @prio[a.option] 
                        else
                            a.key_value - b.key_value
                            
                @add kf for kf in items.keyframes

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

class Canvas
    constructor: (@el, @lat, @long) ->
        @el.width = 400
        @el.height = 250
        @ctx = @el.getContext '2d'
        @nPts = 48
        @timespan = 24 #hours
        d = new Date()
            .setHours 0
            .setMinutes 0
            .getTime()

        console.log 'what2'
        @pts = S.get_sun_altitude new Date(d + i * @timespan * 60 * 60 * 1000 / @nPts), @lat, @long for i in [0 .. @nPts]

    renderAltitude: ->
        yOrigo = @el.height / 2
        @ctx.lineWidth = 1
        console.log 'what'

        # draw horizon
        @ctx.beginPath()
        @ctx.strokeStyle = 'silver'
        @ctx.moveTo 0, yOrigo
        @ctx.lineTo @el.width, yOrigo
        @ctx.stroke()

        # draw 24h sun path
        @ctx.beginPath()
        @ctx.strokeStyle = 'orange'
        @ctx.moveTo 0, @pts[0]
        @ctx.lineTo i * @el.width / @nPts, @pts[i] for i in [1 .. @nPts]
        @ctx.stroke()


app = new Options $ '#keyframes'
