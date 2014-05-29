T = require './temperature_to_color.coffee'
S = require './sun_altitude.coffee'

app =
    opacity: 0.5,
    temperature: 3600,
    css: true, # if not, jsInject
    colors:
        tungsten: 2700,     # altitude < 0 deg
        halogen: 3600,      # altitude < 15 deg
        fluorescent: 4500,  # altitude < 35 deg
        daylight: 5400,     # altitude < 75 deg
        noon: 6300          # otherwise

css_code = (rgba) ->
    "body:after { content: ''; height: 100vh; width: 100vw; z-index: 999999; position: fixed; background: rgba(" + rgba + "); top: 0; left: 0; pointer-events: none; }"

altitude_to_temperature = (altitude) ->
    if      altitude < 0  then app.colors.tungsten
    else if altitude < 15 then app.colors.halogen
    else if altitude < 35 then app.colors.fluorescent
    else if altitude < 75 then app.colors.daylight
    else app.colors.noon

overlay = (color, tabid) ->
    rgba = Math.floor(color.r) + ", " + Math.floor(color.g) + ", " + Math.floor(color.b) + ", " + app.opacity;
    if app.css
        inject = css_code rgba
        chrome.tabs.insertCSS tabid, code: inject

update_tabs = ->
    chrome.tabs.query {}, (tabs) ->
        overlay(T.get_color(app.temperature), tab.id) for tab in tabs

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
