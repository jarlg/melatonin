G = require './canvas.coffee'
C = require './color_helpers.coffee'

$ = document.querySelector.bind document

# transform is applied to the given object's desired attribute before adding to
# storage (ex. for #colorpicker we want this.value, so we add
# transform(this.value) to the storage)
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
        transform: C.hex_to_rgb
        inverse: C.rgb_to_hex
    'opacity':
        el: '#opacity',
        attr: 'value',
        event: 'input'

chrome.storage.local.get (k for own k, _ of map), (it) ->
        for own k, _ of map 
            do (k) ->
                # get values from storage,
                # and put them in the app
                transform = if map[k].inverse? then map[k].inverse else (e) -> e
                $(map[k].el)[map[k].attr] = transform it[k]

                # app updates storage on input
                $ map[k].el
                    .addEventListener map[k].event, ->
                        # looking for a nicer way to write this
                        transform = if map[k].transform? then map[k].transform else (e) -> e
                        obj = {}
                        obj[k] = transform @[map[k].attr]
                        chrome.storage.local.set obj

chrome.storage.local.get ['latitude', 'longitude'], (it) ->
    canvas = new G.AppAltitudeGraph $('#graph'), it.latitude, it.longitude
