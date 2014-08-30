'use strict'

Overlay = require './overlay.coffee'

overlay = new Overlay()

chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
    if request.type is 'set_color'
        overlay.update request.opacity, request.color
