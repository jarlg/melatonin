init_overlay = ->
    overlay = document.createElement 'div'
    update_color overlay, false
    overlay.id = 'melatonin-overlay'
    overlay.style.width = "100vw"
    overlay.style.height = "100vh"
    overlay.style.position = "fixed"
    overlay.style.top = 0
    overlay.style.left = 0
    overlay.style["z-index"] = 99999
    overlay.style["pointer-events"] = "none"
    document.body.appendChild overlay

update_color = (element, transition) ->
    chrome.storage.local.get(
        ['rgb', 'opacity'],
        (items) -> 
            if not element?
                element = document.getElementById 'melatonin-overlay' 
            if transition
                element.style["transition"] = "background-color 2s"
            else
                element.style["transition"] = "background-color 0s"
            rgba_string = items['rgb'] + ", " + items['opacity']
            element.style.backgroundColor = "rgba(" + rgba_string + ")"
    )

init_overlay()

chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
    if request.type == 'update_color'
        update_color null, true
