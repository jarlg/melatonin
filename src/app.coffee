opacity_input = document.getElementById 'opacity'

chrome.runtime.sendMessage
    type: 'get_current_opacity',
    (response) -> opacity.value = response.opacity

opacity_input.addEventListener 'input', (event) ->
    chrome.runtime.sendMessage
        type: 'update_current_opacity',
        opacity: opacity_input.value

js_radio  = document.getElementById 'js-radio'
css_radio = document.getElementById 'css-radio'

chrome.runtime.sendMessage
    type: 'get_css_opt',
    (response) ->
        if response.css
            css_radio.checked = true
        else
            js_radio.checked = true

toggle_css_msg = (val) ->
    chrome.runtime.sendMessage
        type: 'update_css_opt',
        css: val

js_radio.addEventListener 'click', -> toggle_css_msg false
css_radio.addEventListener 'click', -> toggle_css_msg true

#hack to let main.js know when extension window closes
port = chrome.runtime.connect name: 'app'
