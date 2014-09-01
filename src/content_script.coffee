'use strict'

Overlay = require './overlay.coffee'

overlay = new Overlay()

chrome.runtime.sendMessage type: 'init_tab', (resp) ->
    overlay.set resp

chrome.runtime.onMessage.addListener (req, sender, resp) ->
    if req.type is 'set'
        overlay.set opac: req.opac, color: req.color
