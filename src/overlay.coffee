'use strict'

class Overlay
    constructor: ->
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
        chrome.runtime.sendMessage type: 'initialize'

    update: (opac, color) ->
        console.log 'setting color %s and opacity %s', color, opac
        @el.style["background-color"] = "rgba(" + color + ", " + opac + ")"
        console.log 'done.'

module.exports = Overlay
