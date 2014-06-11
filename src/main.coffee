S = require './sun_altitude.coffee'
T = require './temperature_to_color.coffee'
B = require './background_helpers.coffee'

initial_config = 
    last_update: 0,
    opacity: 0.5,
    temperature: 2700,
    altitude: 0,
    rgb: null,
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
            else if not items['last_update']?
                chrome.storage.local.set initial_config, init
            else if Date.now() - items['last_update'] > 1000000 # ~ 15min
                B.update_position()

init()

chrome.alarms.create 'update_position', periodInMinutes: 15
chrome.alarms.onAlarm.addListener B.update_position

chrome.tabs.onUpdated.addListener (tabid, changeInfo, tab) -> B.overlay tab

chrome.runtime.onMessage.addListener (request, sender, sendMessage) ->
    if request.type is 'display'
        console.log request.value
    else if request.type is 'update'
        B.update_position()

chrome.runtime.onConnect.addListener (port) ->
    console.assert (port.name == 'app')

    # on closing the popup, apply final result to all tabs
    # but since we're now applying all updates instantly
    # across all tabs, it's redudant
    #port.onDisconnect.addListener B.overlay_all()
