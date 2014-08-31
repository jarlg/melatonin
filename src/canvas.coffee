'use strict' 

A = require './altitude.coffee'

class AltitudeGraph
    constructor: (@canvas, @lat, @long, w, h, @nPts) ->
        @canvas.width = w
        @canvas.height = h
        
        @radius = 2

        @ctx = @canvas.getContext '2d'

        d = new Date()
        d.setHours 6 # morning / sunrise-ish
        d.setMinutes 0
        d.setSeconds 0
        time = d.getTime()
        @timespan = 24

        @pts = (A.get_altitude new Date(time + i * @timespan * 60 * 60 * 1000 / @nPts), @lat, @long for i in [0 .. @nPts-1])
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

obj = 
    AppAltitudeGraph: class AppAltitudeGraph extends AltitudeGraph
        constructor: (el, lat, long) ->
            super el, lat, long, 200, 129, 24
            idx = @getCurrentIndex()
            @render idx

        # 24 pts for 24 hours, means index = current hour - starting hour
        getCurrentIndex: ->
            idx = new Date()
                    .getHours() - 6
            if idx < 0
                idx += 24
            idx

        render: (n) ->
            super n
            @ctx.fillStyle = 'silver'
            @ctx.font = '18pt sans-serif'
            @ctx.fillText A.get_altitude(new Date(), @lat, @long).toFixed(0) + '\u00B0', @canvas.width - 55, 30

    OptionsAltitudeGraph: class OptionsAltitudeGraph extends AltitudeGraph
        constructor: (el, lat, long) ->
            super el, lat, long, 575, 340, 48
            @render()


module.exports = obj
