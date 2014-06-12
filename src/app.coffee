opacity_input = document.getElementById 'opacity'

chrome.storage.local.get 'opacity', (items) ->
    opacity_input.value = items['opacity']

opacity_input.addEventListener 'input', (event) ->
    chrome.storage.local.set 'opacity': opacity_input.value, -> 
