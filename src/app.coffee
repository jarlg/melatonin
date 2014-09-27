'use strict'

A = require './altitude.coffee'
H = require './helpers.coffee'
C = require './color_helpers.coffee'
K = require './keyframes.coffee'
Storage = require './storage.coffee'

class App
    constructor: (config) ->
        @storage = new Storage config
        @options_port = null

        chrome.runtime.onStartup.addListener => @update()
        chrome.idle.onStateChanged.addListener (newstate) =>
            @update() if newstate is 'active'

        # events
        chrome.alarms.create 'update_altitude', periodInMinutes: 15
        chrome.alarms.onAlarm.addListener => @update()

        chrome.tabs.onUpdated.addListener (_, __, tab) => @refresh_overlay tab

        chrome.runtime.onConnect.addListener (port) =>
            console.assert port.name is 'options'
            @options_port = port
            @options_port.onDisconnect.addListener =>
                @options_port = null

        chrome.runtime.onMessage.addListener (req, sender, resp) =>
            if req.type is 'refresh_all'
                @refresh_all_overlays()
            else if req.type is 'init_popup'
                @storage.get ['opac', 'lat', 'long'], resp
                true # return true for async resp
            else if req.type is 'init_tab'
                @refresh_overlay null, resp
                true
            else if req.type is 'init_options'
                @storage.get ['mode', 'keymode', 'kfs', 'auto_opac', 'color'], resp
                true
            else if req.type is 'update_opacity'
                @update_opacity()
            else if req.type is 'set'
                if req.opac?
                    @set_active_overlay_opacity req.opac

                if req.auto_opac? and @options_port?
                    @options_port.postMessage type: 'set auto_opac', value: req.auto_opac

                @storage.set {
                    opac: req.opac if req.opac?,
                    kfs: req.kfs if req.kfs?,
                    color: req.color if req.color?,
                    mode: req.mode if req.mode?,
                    keymode: req.keymode if req.keymode?,
                    auto_opac: req.auto_opac if req.auto_opac?
                }, -> resp if not chrome.runtime.lastError? then true else false
                true


    essentials: [
        'mode'
        'keymode'
        'alt' 
        'min'
        'max'
        'color'
        'kfs'
        'opac'
        'dir'
        'auto_opac'
    ],

    errHandler: (err) ->
        console.log err.stack or err

    refresh_overlay: (tab, resp) ->
        @storage.get @essentials, (it) ->
            color = K.choose_color it
            if tab?
                chrome.tabs.sendMessage tab.id, {
                    type: 'set',
                    color: color,
                    opac: it.opac
                }
            else if resp?
                resp color: color, opac: it.opac

    refresh_all_overlays: ->
        @storage.get @essentials, (it) ->
            color = K.choose_color it
            chrome.tabs.query {}, (tabs) ->
                chrome.tabs.sendMessage tab.id, {
                    type: 'set',
                    color: color,
                    opac: it.opac
                } for tab in tabs

    update: ->
        @update_storage()
        @update_opacity()

    update_opacity: ->
        @storage.get @essentials, (it) =>
            if it.mode is 'auto' and it.auto_opac
                opac = K.get_opac it
                @set_all_overlay_opacity opac
                @storage.set opac: opac

    set_active_overlay_opacity: (opac) ->
        chrome.tabs.query active: true, (tabs) ->
            chrome.tabs.sendMessage tab.id, {
                type: 'set',
                opac: opac
            } for tab in tabs

    set_all_overlay_opacity: (opac) ->
        chrome.tabs.query {}, (tabs) ->
            chrome.tabs.sendMessage tab.id, {
                type: 'set',
                opac: opac
            } for tab in tabs

    update_storage: ->
        @_get_position (lat, long) =>
            d = new Date()
            @storage.set {
                lat: lat,
                long: long,
                alt: A.get_altitude(d, lat, long),
                dir: A.get_direction(d, lat, long),
                min: A.get_midnight_altitude(d, lat, long),
                max: A.get_noon_altitude(d, lat, long)
            }, => @refresh_all_overlays()

    _get_position: (cb) ->
        if navigator.geolocation?
            navigator.geolocation.getCurrentPosition (loc) ->
                cb loc.coords.latitude, loc.coords.longitude
            , (err) => 
                @errHandler err
        else
            console.log 'Geolocation unavailable'

module.exports = App
