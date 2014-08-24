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
                @canvas = new Canvas $('#graph'), items.latitude, items.longitude
                @canvas.renderAltitude()

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
        d.setHours 0
        d.setMinutes 0
        d.setSeconds 0
        time = d.getTime()

        @pts = []
        for i in [0 .. @nPts-1]
            do (i) =>
                @pts.push S.get_sun_altitude new Date(time + i * @timespan * 60 * 60 * 1000 / @nPts), @lat, @long

        @el.addEventListener 'click', (event) =>
            @el.width = @el.width
            @renderAltitude()
            @ctx.beginPath()
            @ctx.strokeStyle = 'black'
            @ctx.moveTo event.layerX, 0
            @ctx.lineTo event.layerX, @el.height
            @ctx.stroke()

            date = new Date time + @timespan*60*60*1000 * event.layerX / @el.width

            $ '#time-output'
                .innerHTML = date.getHours() + 'h' + if date.getMinutes() < 10 then '0' + date.getMinutes() else date.getMinutes()

            $ '#altitude-output'
                .innerHTML = S.get_sun_altitude date, @lat, @long
                    .toFixed 2
        @

    renderAltitude: ->
        yOrigo = @el.height / 2
        @ctx.lineWidth = 1

        # draw horizon
        @ctx.beginPath()
        @ctx.strokeStyle = 'silver'
        @ctx.moveTo 0, yOrigo
        @ctx.lineTo @el.width, yOrigo
        @ctx.stroke()

        # draw 24h sun path
        @ctx.beginPath()
        @ctx.strokeStyle = 'orange'
        @ctx.moveTo 0, yOrigo - @pts[0]
        @ctx.lineTo i * @el.width / @nPts, yOrigo - @pts[i] for i in [1 .. @nPts]
        @ctx.stroke()


app = new Options $ '#keyframes'
