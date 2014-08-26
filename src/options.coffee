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
                @canvas = new Canvas $('#graph'), $('#units'), items.latitude, items.longitude
                @canvas.renderAltitude()
                @canvas.renderUnits()

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
    constructor: (@el, @units, @lat, @long) ->
        @el.width = 575
        @el.height = 340

        @units.width = @el.width
        @units.height = @el.height

        @ctx = @el.getContext '2d'
        @uCtx = @units.getContext '2d'

        @nPts = 48
        @timespan = 24 #hours

        @margin = 40
        @hoverThreshold = 4

        d = new Date()
        d.setHours 0
        d.setMinutes 0
        d.setSeconds 0
        time = d.getTime()

        @pts = []
        for i in [0 .. @nPts-1]
            do (i) =>
                @pts.push S.get_sun_altitude new Date(time + i * @timespan * 60 * 60 * 1000 / @nPts), @lat, @long

        @ptXs = []
        @ptYs = []
        for i in [0 .. @nPts-1]
            do (i) =>
                @ptXs.push @ptX i
                @ptYs.push @ptY i

        @el.addEventListener 'mousemove', (event) =>
            for i in [0 .. @nPts-1]
                do =>
                    if @hoverThreshold > Math.abs @ptXs[i] - event.layerX
                        @renderAltitude i

        @

    # highlight nth element of @pts
    renderAltitude: (n) ->
        @el.width = @el.width

        n = -1 if not n?

        # draw 24h sun path
        @ctx.fillStyle = 'orange'
        for i in [0 .. @nPts-1]
            do =>
                @ctx.beginPath()
                @ctx.fillStyle = 'red' if i is n
                @ctx.arc @ptXs[i], @ptYs[i], 2, 0, 2*Math.PI, false
                @ctx.fill()
                @ctx.fillStyle = 'orange' if i is n


    renderUnits: ->
        @units.width = @units.width
        @uCtx.font = '8pt sans-serif'
        @uCtx.fillStyle = 'black'

        @uCtx.fillText '90' , 0, @margin
        @uCtx.fillText '0'  , 0, @yOrigo()
        @uCtx.fillText '-90', 0, @el.height - @margin

    yOrigo: -> Math.floor 0.5 + @el.height / 2

    ptX: (i) ->
        @margin + i * (@el.width - 2*@margin) / @nPts

    ptY: (i) ->
        @yOrigo() - @pts[i]*(@el.height-2*@margin)/(2*90) 



app = new Options $ '#keyframes'
