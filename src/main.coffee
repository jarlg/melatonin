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
    B.bind_storage_events()
    chrome.storage.local.get (key for own key, _ of initial_config),
        (items) ->
            if chrome.runtime.lastError 
                console.log "error when accessing storage!"
            else if not items['last_update']?
                chrome.storage.local.set initial_config, init
            else if Date.now() - items['last_update'] > 1000000 # ~ 15min
                B.update_position()

chrome.storage.local.clear init

chrome.alarms.create 'update_position', periodInMinutes: 15
chrome.alarms.onAlarm.addListener B.update_position

chrome.tabs.onUpdated.addListener (tabid, changeInfo, tab) -> B.overlay tab

chrome.runtime.onConnect.addListener (port) ->
    console.assert (port.name == 'app')

    # on closing the popup, apply final result to all tabs
    port.onDisconnect.addListener B.overlay_all()
