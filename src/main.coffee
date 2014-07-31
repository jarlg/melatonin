B = require './background_helpers.coffee'

initial_config = 
    on: true,
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
    temperature_map:
        night: 2700,     # altitude < 0 deg
        day: 6300          # otherwise

init = ->
    console.log 'init melatonin ext'
    B.bind_storage_events()
    chrome.storage.local.get (key for own key, _ of initial_config),
        (items) ->
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
