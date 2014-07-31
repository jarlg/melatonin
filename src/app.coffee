opacity_input = document.getElementById 'opacity'
on_off_toggle = document.getElementById 'on-off-toggle'
custom_toggle = document.getElementById 'custom-toggle'
colorpicker = document.getElementById 'colorpicker'

chrome.storage.local.get ['on', 'opacity', 'custom', 'custom_color'], (items) ->
    opacity_input.value = items.opacity
    on_off_toggle.checked = items.on
    custom_toggle.checked = items.custom
    colorpicker = items.custom_color

opacity_input.addEventListener 'input', (event) ->
    chrome.storage.local.set 'opacity': opacity_input.value, -> 

on_off_toggle.addEventListener 'click', (event) ->
    chrome.storage.local.set 'on' : on_off_toggle.checked, ->

custom_toggle.addEventListener 'click', (event) ->
    chrome.storage.local.set 'on' : custom_toggle.checked, ->

colorpicker.addEventListener 'click', (event) ->
    chrome.storage.local.set 'on' : colorpicker.value, ->
