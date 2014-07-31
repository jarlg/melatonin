opacity_input = document.getElementById 'opacity'
on_off_toggle = document.getElementById 'on-off-toggle'
custom_toggle = document.getElementById 'custom-toggle'
colorpicker = document.getElementById 'colorpicker'

chrome.storage.local.get ['on', 'opacity', 'custom', 'custom_color'], (items) ->
    on_off_toggle.checked = items.on
    custom_toggle.checked = items.custom
    opacity_input.value = items.opacity
    colorpicker.value = items.custom_color

opacity_input.addEventListener 'input', (event) ->
    chrome.storage.local.set 'opacity': @value, -> 

colorpicker.addEventListener 'input', (event) ->
    chrome.storage.local.set 'custom_color' : @value, ->

on_off_toggle.addEventListener 'click', (event) ->
    chrome.storage.local.set 'on' : @checked, ->

custom_toggle.addEventListener 'click', (event) ->
    chrome.storage.local.set 'custom' : @checked, ->
