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

set_bgcolor = (element, color, opacity) ->
    if color?
        element.style['background-color'] = "rgba(" + color + ", " + opacity + ")"
    else
        element.style['background-color'] = "transparent"

update_color = (element) ->
    if not element?
        element = document.getElementById 'melatonin-overlay' 
    chrome.storage.local.get(
        ['on', 'rgb', 'opacity', 'custom', 'custom_color'],
        (items) -> 
            if items.on
                if not items.custom
                    console.log "setting color " + items.rgb
                    set_bgcolor element, items.rgb, items.opacity
                else
                    set_bgcolor element, items.custom_color, items.opacity
            else
                set_bgcolor element
    )

init_overlay()

chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
    if request.type == 'update_color'
        update_color()
