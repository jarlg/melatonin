'use strict'

A = require './altitude.coffee'
H = require './helpers.coffee'
C = require './color_helpers.coffee'
K = require './keyframes.coffee'
Storage = require './storage.coffee'
Notification = require './notification.coffee'

class App
    constructor: (config) ->
        @storage = new Storage config
        @options_port = null

        chrome.runtime.onStartup.addListener =>
            console.log 'Starting up; calling update!'
            @update()

        chrome.idle.onStateChanged.addListener (newstate) =>
            if newstate is 'active'
                console.log 'Changed state to \'active\'; calling update!'
                @update()

        chrome.alarms.create 'update_altitude', periodInMinutes: 15
        chrome.alarms.onAlarm.addListener =>
            console.log 'Regular 15min alarm; calling update!'
            @update()

        chrome.tabs.onUpdated.addListener (tabId, changeInfo, tab) => 
            @storage.get 'last_update', (it) =>
                @refresh_overlay tab
                if Date.now() - it.last_update > 1000*60*15 # 15 minutes
                    console.log 'Tab updated and long time since update; updating!'
                    @update()

        chrome.runtime.onConnect.addListener (port) =>
            console.assert port.name is 'options'
            console.log 'Connected to options page!'
            @update()
            @options_port = port
            @options_port.onDisconnect.addListener =>
                @options_port = null

        #return true for asynchroneous responding to sender using resp
        chrome.runtime.onMessage.addListener (req, sender, resp) =>
            if req.type is 'update_all' or req.type is 'update_opacity'
                @update_opacity @refresh_all_overlays.bind @
            else if req.type is 'init_popup'
                console.log 'Opened popup; triggering update.'
                @update()
                @storage.get ['opac', 'lat', 'long'], resp
                true
            else if req.type is 'init_tab'
                @storage.get 'last_update', (it) =>
                    @refresh_overlay null, resp
                    if Date.now() - it.last_update > 1000*60*15 # 15 minutes
                        console.log 'Tab created and long time since update; updating!'
                        @update()
                true
            else if req.type is 'init_options'
                @storage.get ['mode', 'keymode', 'kfs', 'auto_opac', 'color'], resp
                true
            else if req.type is 'blendmode_notify'
                @storage.get 'last_blendmode_notification', (it) =>
                    if Date.now() - it.last_blendmode_notification > 7 * 24 * 60 * 60 * 1000 # blendmode notification frequency: 1 week
                        @storage.set last_blendmode_notification: Date.now(), -> Notification.activate_blendmode_notification()
            else if req.type is 'set'
                if req.opac?
                    @set_overlay_opacity req.opac

                if req.auto_opac? and @options_port?
                    @options_port.postMessage type: 'set auto_opac', value: req.auto_opac

                @storage.set {
                    opac: req.opac if req.opac?,
                    kfs: req.kfs if req.kfs?,
                    color: req.color if req.color?,
                    mode: req.mode if req.mode?,
                    keymode: req.keymode if req.keymode?,
                    auto_opac: req.auto_opac if req.auto_opac?
                }, resp
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
        console.log 'Refreshing all overlays!'
        @storage.get @essentials, (it) =>
            color = K.choose_color it
            chrome.tabs.query {}, (tabs) ->
                chrome.tabs.sendMessage tab.id, {
                    type: 'set',
                    color: color,
                    opac: it.opac
                } for tab in tabs

    set_overlay_opacity: (opac) ->
        chrome.tabs.query {}, (tabs) ->
            chrome.tabs.sendMessage tab.id, {
                type: 'set',
                opac: opac
            } for tab in tabs

    # recalculates altitude and opacity, and stores them
    update: ->
        console.log 'Initiating update...'
        @update_storage @update_opacity.bind @

    update_opacity: (cb) ->
        @storage.get @essentials, (it) =>
            @storage.set opac: K.choose_opac(it), cb

    update_storage: (cb) ->
        @_get_position (lat, long) =>
            d = new Date()
            if lat? and long?
                @storage.set {
                    lat: lat if lat,
                    long: long if long,
                    alt: A.get_altitude(d, lat, long),
                    dir: A.get_direction(d, lat, long),
                    min: A.get_midnight_altitude(d, lat, long),
                    max: A.get_noon_altitude(d, lat, long)
                }, cb
            else
                cb()

    _get_position: (cb) ->
        if navigator.geolocation?
            console.log 'Requesting geolocation...'
            navigator.geolocation.getCurrentPosition (loc) ->
                cb loc.coords.latitude, loc.coords.longitude
                console.log 'Got location (%s, %s)!', loc.coords.latitude, loc.coords.longitude
            , (err) => 
                @errHandler err
                console.log '... but refreshing all overlays with values in storage.'
                cb()
            , timeout: 3000
        else
            console.log 'Geolocation unavailable'

module.exports = App
