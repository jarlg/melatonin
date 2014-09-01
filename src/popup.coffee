'use strict'

Graph = require './canvas.coffee'
$ = document.querySelector.bind document

chrome.runtime.sendMessage type: 'init_popup', (resp) ->
    canvas = new Graph resp.lat, resp.long, $ '#graph'
    $ '#opacity'
        .value = resp.opac

$ '#opacity'
    .addEventListener 'input', ->
        chrome.runtime.sendMessage type: 'set_opac', opac: @value
