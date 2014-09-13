'use strict'

C = require './color_helpers.coffee'

class Overlay
    constructor: ->
        @opac = 0
        @color = null
        @el = document.createElement 'div'
        @el.style["transition"] = "background-color 0.2s" # reduce the flashing
        @el.style.width = "100vw"
        @el.style.height = "100vh"
        @el.style.position = "fixed"
        @el.style.top = 0
        @el.style.left = 0
        @el.style["z-index"] = 9999999999
        @el.style["pointer-events"] = "none"
        document.body.appendChild @el

    set: (obj) ->
        console.log 'got msg to set'
        console.log obj
        @opac = obj.opac if obj.opac?
        @color = obj.color if obj.color?
        @render()

    render: ->
        @el.style["background-color"] = "rgba(" + C.rgb_to_string(@color) + ", " + @opac + ")"

module.exports = Overlay
