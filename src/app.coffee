C = require './canvas.coffee'
$ = document.querySelector.bind document

# i think i lost myself a bit

map = 
    'on':
        el: '#active-toggle',
        attr: 'checked',
        event: 'click'
    'custom_opacity':
        el: '#opacity-toggle',
        attr: 'checked',
        event: 'click'
    'custom_color':
        el: '#color-toggle',
        attr: 'checked',
        event: 'click'
    'color':
        el: '#colorpicker',
        attr: 'value',
        event: 'input'
    'opacity':
        el: '#opacity',
        attr: 'value',
        event: 'input'

chrome.storage.local
    .get (key for own key, _ of map), (items) ->
        for own key, obj of map 
            do (key, obj) ->
                # get values from storage,
                # and put them in the app
                $(map[key].el)[map[key].attr] = items[key]

                # app updates storage on input
                $ map[key].el
                    .addEventListener map[key].event, ->
                        console.log 'there was input'
                        # looking for a nicer way to write this
                        obj = {}
                        obj[key] = @[map[key].attr]
                        chrome.storage.local.set obj

chrome.storage.local
    .get ['latitude', 'longitude'], (items) ->
        canvas = new C.AppAltitudeGraph $('#graph'), items.latitude, items.longitude
