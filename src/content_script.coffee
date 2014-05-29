# to be injected by content_script or executeScript

overlay = document.createElement 'div'
overlay.id = 'melatonin-overlay'
overlay.style.width = "100vw"
overlay.style.height = "100vh"
overlay.style.position = "fixed"
overlay.style.top = 0
overlay.style.left = 0
overlay.style["z-index"] = 99999
overlay.style["pointer-events"] = "none"
document.body.appendChild overlay

update_color = (rgba_string) ->
    document.getElementById 'melatonin-overlay'
        .style.backgroundColor = "rgba(" + rgba_string + ")"

chrome.runtime.sendMessage 
    type: 'get_current_color',
    (r) -> update_color r.rgba_string

chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
    if request.type == 'update_color'
        update_color request.rgba_string
