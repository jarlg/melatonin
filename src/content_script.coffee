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

chrome.runtime.sendMessage 
    type: 'get_current_color',
    (r) -> document.getElementById('melatonin-overlay').style.backgroundColor = "rgba(" + r.color + ")"; console.log r.color
