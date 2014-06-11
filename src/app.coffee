opacity_input = document.getElementById 'opacity'
sun_altitude = document.getElementById 'altitude'

chrome.storage.local.get ['opacity', 'altitude'], (items) ->
    opacity_input.value = items['opacity']
    sun_altitude.innerHTML = items['altitude'].toFixed(0)

opacity_input.addEventListener 'input', (event) ->
    chrome.storage.local.set 'opacity': opacity_input.value, -> 

sun_altitude.addEventListener 'click', (event) ->
    chrome.runtime.sendMessage type: 'update', ->
        chrome.storage.local.get 'altitude', (item) ->
            sun_altitude.innerHTML = item['altitude']
