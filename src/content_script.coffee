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

update_color = (element) ->
    if not element?
        element = document.getElementById 'melatonin-overlay' 
    chrome.storage.local.get(
        ['rgb', 'opacity'],
        (items) -> 
            rgba_string = items['rgb'] + ", " + items['opacity']
            element.style['background-color'] = "rgba(" + rgba_string + ")"
    )

init_overlay()

chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
    if request.type == 'update_color'
        update_color()
