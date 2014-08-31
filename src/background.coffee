'use strict'

H = require './helpers.coffee'
C = require './color_helpers.coffee'
S = require './storage.coffee'
M = require './keyframes.coffee'

obj =
    config:
        on: true,
        version: '0.3.0',
        last_update: 0,
        idle_state: 'active',
        custom_color: false,
        color: null, # color is an rgb object
        custom_opacity: true,
        opacity: 0.5,
        latitude: null,
        longitude: null,
        keyframes: [
            new M.Keyframe 'altitude', 0, 'temperature', 2700
            new M.Keyframe 'altitude', 90, 'temperature', 6300
        ]

    init: ->
        chrome.storage.local.get null, (it) =>
            console.log 'initializing Melatonin(%s)...', it.version
            if not it.version? or it.version isnt @config.version
                console.log 'updating version; clearing storage...'
                chrome.storage.local.clear =>
                    console.log 'cleared storage'
                    chrome.storage.local.set 'version': @config.version, @init
            else
                @bind_storage_events()
                console.log 'in storage: '
                for own k, v of it
                    console.log '%s : %s', k, v
                if chrome.runtime.lastError 
                    console.log "error when accessing storage!"
                    return
                # check if any keys are not set, and initialize them
                for own k, v of @config
                    do (k, v) ->
                        if not it[k]?
                            # this is ugly
                            obj = {}
                            obj[k] = v
                            chrome.storage.local.set obj
                if Date.now() - it.last_update > 15 * 60 * 1000 # 15min
                    @update_position()

    errHandler: (err) ->
        console.log err.stack or err

    overlay: (tab, opac, color) ->
        chrome.tabs.sendMessage tab.id, {
            type: 'set_color',
            opacity: opac,
            color: color
        }

    update_overlay: (tab) ->
        S.with_color (opac, rgb) =>
            @overlay tab, opac, C.rgb_to_string rgb

    update_overlays: ->
        S.with_color (opac, rgb) =>
            chrome.tabs.query {}, (tabs) =>
                @overlay tab, opac, C.rgb_to_string(rgb) for tab in tabs

    bind_storage_events: ->
        chrome.storage.onChanged.addListener (changes, namespace) =>
            for own k, v of changes
                do (k, v) =>
                    if k is 'last_update'
                        console.log 'updated %s from %s to %s (%smin)',
                            k, v.oldValue, v.newValue,
                            ((v.newValue - v.oldValue) / (1000 * 60)).toFixed 0
                    else
                        console.log 'updated %s from %s to %s',
                            k, v.oldValue, v.newValue

                    if (k is 'on' and v.newValue) or k is 'idle_state'
                        @update_position()

                    if H.contains k, [
                        'on'
                        'custom_color'
                        'color'
                        'custom_opacity'
                        'opacity'
                        'longitude'
                        'latitude'
                        'keyframes'
                    ]
                        @update_overlays()

    update_position: ->
        if navigator.geolocation?
            navigator.geolocation.getCurrentPosition (loc) ->
                chrome.storage.local
                    .set 'latitude': loc.coords.latitude
                        ,'longitude': loc.coords.longitude
                        ,'last_update': Date.now()
            , (err) => 
                console.log "Geolocation Error:"
                @errHandler err
                chrome.storage.local.set 'last_update': Date.now()
            , ->
        else
            console.log 'Geolocation unavailable'

module.exports = obj
