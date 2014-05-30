opacity_input = document.getElementById 'opacity'

chrome.runtime.sendMessage
    type: 'get_current_opacity',
    (response) -> opacity.value = response.opacity

opacity_input.addEventListener 'input', (event) ->
    chrome.runtime.sendMessage
        type: 'update_current_opacity',
        opacity: opacity_input.value

#hack to let main.js know when extension window closes
port = chrome.runtime.connect name: 'app'
