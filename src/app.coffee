opacity_input = document.getElementById 'opacity'
on_off_toggle = document.getElementById 'on-off-toggle'

chrome.storage.local.get ['on', 'opacity'], (items) ->
    opacity_input.value = items['opacity']
    if items['on']
        on_off_toggle.innerHTML = 'off'
        on_off_toggle.style['background-color'] = "red"
    else
        on_off_toggle.innerHTML = 'on'
        on_off_toggle.style['background-color'] = "green"

opacity_input.addEventListener 'input', (event) ->
    chrome.storage.local.set 'opacity': opacity_input.value, -> 

on_off_toggle.addEventListener 'click', (event) ->
    if on_off_toggle.innerHTML is 'on'
        on_off_toggle.innerHTML = 'off'
        on_off_toggle.style['background-color'] = "green"
        chrome.storage.local.set 'on': true, ->
    else
        on_off_toggle.innerHTML = 'on'
        on_off_toggle.style['background-color'] = "green"
        chrome.storage.local.set 'on': false, ->
