'use strict'

A = require './altitude.coffee'
H = require './helpers.coffee'
C = require './color_helpers.coffee'
K = require './keyframes.coffee'
Storage = require './storage.coffee'

class App
    constructor: (config) ->
        @storage = new Storage config

        # events
        chrome.alarms.create 'update_altitude', periodInMinutes: 15
        chrome.alarms.onAlarm.addListener @update_altitude

        chrome.tabs.onUpdated.addListener (_, __, tab) -> B.refresh_overlay tab

        chrome.runtime.onMessage.addListener (req, sender, resp) ->
            if req.type is 'new_altitude'
                @refresh_all_overlays()
            else if req.type is 'init_popup'
                @storage.get ['opac', 'lat', 'long'], resp
            else if req.type is 'init_tab'
                @storage.get [
                    'mode'
                    'alt' 
                    'min'
                    'max'
                    'color'
                    'kfs'
                    'opac'
                    'dir'
                ], (it) =>
                    if it.mode is 'manual'
                        resp color: it.color, opac: it.opac
                    else
                        res opac: it.opac, color: H.get_color it.kfs, it.alt, it.dir, it.min, it.max
            else if req.type is 'set_opac'
                chrome.tabs.query {}, (tabs) ->
                    chrome.tabs.sendMessage tab.id, type: 'set', opac: req.opac for tab in tabs
                @storage.set 'opac': req.opac

    errHandler: (err) ->
        console.log err.stack or err

    refresh_all_overlays: ->
        @storage.get ['mode', 'alt', 'opac', 'kfs', 'dir'], (it) =>
            false

    update_altitude: ->
        @get_altitude (alt, min, max) => @storage.set 'alt': alt, 'min': min, 'max': max

    get_altitude: (cb) ->
        @_get_position (lat, long) =>
            d = new Date()
            cb A.get_altitude(d, lat, long), A.get_lowest_altitude(d, lat, long), A.get_highest_altitude(d, lat, long)

    _get_position: (cb) ->
        if navigator.geolocation?
            navigator.geolocation.getCurrentPosition (loc) ->
                cb loc.coords.latitude, loc.coords.longitude
            , (err) => 
                @errHandler err
        else
            console.log 'Geolocation unavailable'

module.exports = App
