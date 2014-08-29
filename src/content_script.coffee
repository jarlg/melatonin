C = require './color_helpers.coffee'
T = require './temperature_to_color.coffee'

init_overlay = ->
    overlay = document.createElement 'div'
    overlay.style["transition"] = "background-color 0.2s" # reduce the flashing
    update_color overlay
    overlay.id = 'melatonin-overlay'
    overlay.style.width = "100vw"
    overlay.style.height = "100vh"
    overlay.style.position = "fixed"
    overlay.style.top = 0
    overlay.style.left = 0
    overlay.style["z-index"] = 9999999999
    overlay.style["pointer-events"] = "none"
    document.body.appendChild overlay

set_bgcolor = (el, color, opacity) ->
    if color?
        el.style['background-color'] = "rgba(" + color + ", " + opacity + ")"
    else
        el.style['background-color'] = "transparent"

handle_customs = (el, items, opac) ->
    if not items.custom_color
        set_bgcolor el, C.rgb_to_string(T.get_color items.temperature), opac
    else
        set_bgcolor el, C.rgb_to_string(C.hex_to_rgb items.color), opac


update_color = (el) ->
    console.log "updating color!"
    if not el?
        el = document.getElementById 'melatonin-overlay' 
    chrome.storage.local
        .get [
            'on'
            'temperature'
            'opacity'
            'custom_opacity'
            'color'
            'custom_color'
        ], (items) -> 
            if items.on
                if items.custom_opacity
                    handle_customs el, items, items.opacity
                else
                    C.get_atm_opac (opac) -> handle_customs el, items, opac
            else
                set_bgcolor el

init_overlay()

chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
    if request.type is 'update_color'
        update_color()
