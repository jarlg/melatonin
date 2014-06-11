opacity_input = document.getElementById 'opacity'
sun_altitude = document.getElementById 'altitude'

chrome.storage.local.get ['opacity', 'altitude'], (items) ->
    console.log 'opacity: %s, altitude: %s', items['opacity'], items['altitude']
    opacity_input.value = items['opacity']
    sun_altitude.innerHTML = items['altitude']

opacity_input.addEventListener 'input', (event) ->
    console.log 'updating opacity'
    chrome.storage.local.set 'opacity': opacity_input.value, -> 

#hack to let main.js know when extension window closes
port = chrome.runtime.connect name: 'app'
