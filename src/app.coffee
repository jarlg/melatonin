opacity_input = document.getElementById 'opacity'
on_off_toggle = document.getElementById 'on-off-toggle'

chrome.storage.local.get ['on', 'opacity'], (items) ->
    opacity_input.value = items['opacity']
    if items['on']
        on_off_toggle.checked = true
    else
        on_off_toggle.checked = false

opacity_input.addEventListener 'input', (event) ->
    chrome.storage.local.set 'opacity': opacity_input.value, -> 

on_off_toggle.addEventListener 'click', (event) ->
    chrome.storage.local.set 'on' : on_off_toggle.checked, ->
