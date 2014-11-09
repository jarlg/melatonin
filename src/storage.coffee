'use strict'

H = require './helpers.coffee'
A = require './altitude.coffee'
C = require './color_helpers.coffee'

class Storage
    constructor: (config) ->
        @get null, (it) =>
            if not it.ver? or it.ver < config.ver
              
                # if the previous version is sufficiently recent,
                # we keep some user specified values
                if '0.3.0' <= it.ver
                    keep = [
                      'kfs'
                      'keymode'
                      'mode'
                      'color'
                      'auto_opac'
                    ]

                    for key in keep
                        do -> config[key] = it[key] if it[key]?

                @clear =>
                    @set config, =>
                        @print()
                        @bind_events()

            @print()
            @bind_events()

    set: (obj, cb) ->
        if H.contains 'altitude', (k for own k, _ of obj)
            obj.last_update = Date.now()
        chrome.storage.local.set obj, cb

    get: (arr, cb) ->
        chrome.storage.local.get arr, cb

    clear: (cb) ->
        chrome.storage.local.clear cb

    print: ->
        @get null, (it) ->
            console.log 'in storage:'
            for own k, v of it
                do ->
                    console.log k + " : " + v

    bind_events: ->
        chrome.storage.onChanged.addListener (changes, namespace) =>
            refresh_requested = false
            for own k, v of changes
                do (k, v) ->
                    if H.contains k, ['alt', 'kfs', 'mode', 'keymode', 'color']
                        if not refresh_requested
                          refresh_requested = true
                    else if k is 'auto_opac' and v.newValue
                        chrome.runtime.sendMessage type: 'update_opacity'

            if refresh_requested
                chrome.runtime.sendMessage type: 'update_all'

module.exports = Storage
