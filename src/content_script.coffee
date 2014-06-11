overlay = document.createElement 'div'
overlay.id = 'melatonin-overlay'
update_color overlay
overlay.style.width = "100vw"
overlay.style.height = "100vh"
overlay.style.position = "fixed"
overlay.style.top = 0
overlay.style.left = 0
overlay.style["z-index"] = 99999
overlay.style["pointer-events"] = "none"
document.body.appendChild overlay

update_color = (element) ->
    if not element?
        element = document.getElementById 'melatonin-overlay' 
    chrome.storage.local.get(
        ['rgb', 'opacity'],
        ((items) -> 
            rgba_string = items['rgb'] + ", " + items['opacity']
            element.style.backgroundColor = "rgba(" + rgba_string + ")"
        )
    )

chrome.runtime.onMessage.addListener (request, sender, sendResponse) ->
    if request.type == 'update_color'
        update_color()
