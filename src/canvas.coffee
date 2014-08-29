S = require './sun_altitude.coffee'

AltitudeGraph: class AltitudeGraph
    constructor: (@canvas, @lat, @long, w, h, @nPts) ->
        @canvas.width = w
        @canvas.h = h
        
        @radius = 2

        @ctx = @canvas.getContext '2d'

        d = new Date()
        d.setHours 6 # morning / sunrise-ish
        d.setMinutes 0
        d.setSeconds 0
        time = d.getTime()
        @timespan = 24

        @pts = (S.get_sun_altitude new Date(time + i * @timespan * 60 * 60 * 1000 / @nPts), @lat, @long for i in [0 .. @nPts-1])
        console.log @pts
        @

    yOrigo: -> Math.floor 0.5 + @canvas.height/2

    render: (n) -> # point n is rendered red
        # clear canvas
        @canvas.width = @canvas.width 

        n = -1 if not n?

        @ctx.fillStyle = 'orange'
        for i in [0 .. @nPts-1]
            do =>
                @ctx.beginPath()
                @ctx.fillStyle = 'red' if i is n
                @ctx.arc @ptX(i), @ptY(i), @radius, 0, 2*Math.PI, false
                @ctx.fill()
                @ctx.fillStyle = 'orange' if i is n

    ptX: (i) ->
        @radius + i * (@canvas.width - 2*@radius) / @nPts

    ptY: (i) ->
        @yOrigo() - @pts[i]*@canvas.height/(2*90) 

AppAltitudeGraph: class AppAltitudeGraph extends AltitudeGraph
    constructor: (el, lat, long) ->
        super el, lat, long, 200, 129, 24
        idx = @getCurrentIndex()
        console.log idx
        @render idx

    # 24 pts for 24 hours, means index = current hour - starting hour
    getCurrentIndex: ->
        new Date()
            .getHours() - 6


module.exports = AppAltitudeGraph
