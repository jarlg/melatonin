'use strict'

C = require './color_helpers.coffee'

class Overlay
    constructor: ->
        @opac = 0
        @color = null

        @el = document.createElement 'melatonin-overlay'

        @el.style["transition"] = "background-color 0.2s" # reduce the flashing
        
        @el.style.position = "fixed"

        # will span entire screen
        @el.style.top = 0
        @el.style.left = 0
        @el.style.right = 0
        @el.style.bottom = 0

        @el.style["z-index"] = 9999999999
        @el.style["pointer-events"] = "none"

        document.body.appendChild @el

    set: (obj) ->
        @opac = obj.opac if obj.opac?
        @color = obj.color if obj.color?
        @render()

    render: ->
        @el.style["background-color"] = "rgb(" + C.rgb_to_string(@color) + ")"
        @el.style.opacity = @opac

module.exports = Overlay
