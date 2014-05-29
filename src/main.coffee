T = require './temperature_to_color.coffee'
S = require './sun_altitude.coffee'

app =
    opacity: 0.5,
    temperature: 3600,
    color: {},
    css: false, # if not, jsInject
    colors:
        tungsten: 2700,     # altitude < 0 deg
        halogen: 3600,      # altitude < 15 deg
        fluorescent: 4500,  # altitude < 35 deg
        daylight: 5400,     # altitude < 75 deg
        noon: 6300          # otherwise

css_code = (rgba) ->
    "body:after { content: ''; height: 100vh; width: 100vw; z-index: 999999; position: fixed; background: rgba(" + rgba + "); top: 0; left: 0; pointer-events: none; }"

get_current_rgba = ->
    rgba  = Math.floor(app.color.r) + ", "
    rgba += Math.floor(app.color.g) + ", "
    rgba += Math.floor(app.color.b) + ", " + app.opacity

altitude_to_temperature = (altitude) ->
    if      altitude < 0  then app.colors.tungsten
    else if altitude < 15 then app.colors.halogen
    else if altitude < 35 then app.colors.fluorescent
    else if altitude < 75 then app.colors.daylight
    else app.colors.noon

insert_css = (tabid) ->
    console.log tabid
    chrome.tabs.insertCSS tabid, code: css_code get_current_rgba(), ->

js_update_overlay = (tabid) ->
    chrome.tabs.sendMessage tabid, 
        type: 'update_color',
        rgba_string: get_current_rgba()
        , ->

overlay = (tab) ->
    if app.css
        insert_css (if tab? then tab.id else null)
    else if tab?
        js_update_overlay tab.id
    else
        chrome.tabs.query active: true, currentWindow: true,
            (tabs) -> js_update_overlay tabs[0].id

update_tabs = ->
    chrome.tabs.query {},
        (tabs) -> overlay tab for tab in tabs

update_app = (location) ->
    update_temperature location
    update_tabs()

update_temperature = (location) ->
    date = new Date()
    altitude = S.get_sun_altitude(
        date,
        location.coords.longitude,
        location.coords.latitude
    )
    app.temperature = altitude_to_temperature altitude
    app.color = T.get_color app.temperature

update = (alarm) ->
    if navigator.geolocation
        navigator.geolocation.getCurrentPosition(
            update_app, # callback
            console.log, # output error
            {}
        )
    else
        console.log "No geolocation. Can't update color temperature."

update()

chrome.alarms.create 'update', periodInMinutes: 20
chrome.alarms.onAlarm.addListener update

# alternative to content_script
#chrome.tabs.onCreated.addListener overlay

# alternatively, content_script to update own tab on focus?
chrome.tabs.onUpdated.addListener (tabid, changeInfo, tab) -> overlay tab

chrome.runtime.onConnect.addListener (port) ->
    console.assert (port.name == 'app')

    # on closing the popup, apply final result to all tabs
    port.onDisconnect.addListener update_tabs

chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
    if request.type == 'get_current_opacity'
        sendResponse opacity: app.opacity
    else if request.type == 'get_current_color'
        sendResponse rgba_string: get_current_rgba()
    else if request.type == 'get_css_opt'
        sendResponse css: app.css
    else if request.type == 'update_current_opacity'
        app.opacity = request.opacity
        # only applied to current tab, for realtime updates
        overlay sender.tab
    else if request.type == 'update_css_opt'
        if app.css != request.css
            app.css = request.css
            toggle_css()
            overlay sender.tab

# when we change the functionality of the overlay, disable the other
# functionality by making it completely transparent!
toggle_css = () ->
    chrome.tabs.query {}, (tabs) ->
        for tab in tabs
            do (tab) ->
                if app.css
                    chrome.tabs.sendMessage tab.id,
                            type: 'update_color',
                            rgba_string: '0,0,0,0'
                else
                    chrome.tabs.insertCSS tab.id,
                            code: css_code '0,0,0,0'
