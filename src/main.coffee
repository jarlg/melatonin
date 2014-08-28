B = require './background_helpers.coffee'
M = require './models.coffee'

initial_config = 
    on: true,
    version: '0.3.0',
    custom: false,
    idle_state: 'active',
    last_update: 0,
    opacity: 0.5,
    temperature: 2700,
    altitude: 0,
    rgb: null,
    custom_color: null,
    latitude: null,
    longitude: null,
    keyframes: [
        new M.Keyframe 'altitude', 0, 'temperature', 2700
        new M.Keyframe 'altitude', 90, 'temperature', 6300
    ]

init = ->
    console.log 'init melatonin ext'
    chrome.storage.local
        .get 'version', (item) ->
            if not item.version? or item.version isnt initial_config.version
                console.log 'updating version; clearing storage.'
                chrome.storage.local.clear ->
                    chrome.storage.local
                        .set 'version': initial_config.version, init
            else
                B.bind_storage_events()
                chrome.storage.local
                    .get (key for own key, _ of initial_config), (items) ->
                        console.log 'in storage: '
                        for own key, val of items
                            console.log '%s : %s', key, val
                        if chrome.runtime.lastError 
                            console.log "error when accessing storage!"
                            return
                        # check if any keys are not set, and initialize them
                        for own key, val of initial_config
                            do (key, val, items) ->
                                if not items[key]?
                                    obj = {}
                                    obj[key] = val
                                    chrome.storage.local.set obj
                        if Date.now() - items.last_update > 15 * 60 * 1000
                            B.update_position()

init()

chrome.alarms.create 'update_position', periodInMinutes: 15
chrome.alarms.onAlarm.addListener B.update_position

chrome.tabs.onUpdated.addListener (tabid, changeInfo, tab) -> B.overlay tab

chrome.idle.onStateChanged.addListener (newstate) ->
    console.log 'idle state change to ' + newstate
    chrome.storage.local.set 'idle_state': newstate, ->

chrome.runtime.onMessage.addListener (request, sender, sendMessage) ->
    if request.type is 'display'
        console.log request.value
    else if request.type is 'update'
        B.update_position()
