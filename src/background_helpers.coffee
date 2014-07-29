S = require './sun_altitude.coffee'
T = require './temperature_to_color.coffee'

obj =
    errHandler: (err) ->
        console.log err.stack or err

    overlay: (tab) ->
        if tab?
            chrome.tabs.sendMessage(
                tab.id,
                type: 'update_color'
            )
        else
            # could query out the active one..
            @overlay_all()

    overlay_all: ->
        chrome.tabs.query(
            {},
            (tabs) => @overlay tab for tab in tabs,
        )

    bind_storage_events: ->
        chrome.storage.onChanged.addListener (changes, namespace) =>
            for own key, val of changes
                do (key, val, namespace) =>
                    if key is 'last_update'
                        console.log 'updated %s from %s to %s (%smin)',
                            key, val.oldValue, val.newValue,
                            ((val.newValue - val.oldValue) / (1000 * 60)).toFixed(0)
                    else
                        console.log 'updated %s from %s to %s',
                            key, val.oldValue, val.newValue
                    if key is 'last_update'
                        chrome.storage.local.get(
                            ['longitude', 'latitude'],
                            (items) -> 
                                chrome.storage.local.set(
                                    'altitude': S.get_sun_altitude(
                                        new Date(),
                                        items['latitude'],
                                        items['longitude']
                                    ), ->
                                )
                        )
                    else if key is 'altitude'
                        chrome.storage.local.get(
                            'temperature_map',
                            (item) =>
                                chrome.storage.local.set(
                                    'temperature': @alt_to_temp(
                                                    val.newValue,
                                                    item['temperature_map']
                                    ), ->
                                )
                        )
                    else if key is 'temperature'
                        c = T.get_color val.newValue
                        chrome.storage.local.set(
                            'rgb': c.r + ", " + c.g + ", " + c.b,
                            ->
                        )
                    else if key is 'rgb'
                        @overlay_all()
                    else if key is 'opacity'
                        @overlay()
                    else if key is 'on'
                        if val.newValue is true
                            @update_position()
                    else if key is 'idle_state'
                        if val.newValue is 'active'
                            console.log 'went from idle to active. updating.'
                            @update_position()

    alt_to_temp: (alt, map) ->
        if alt < 0
            map.night
        else # linear
            t_alt = alt 
            ((90 - alt) * map.night + alt * map.day) / 90

    update_position: ->
        if navigator.geolocation?
            navigator.geolocation.getCurrentPosition ((loc) ->
                    chrome.storage.local.set(
                        'latitude': loc.coords.latitude,
                        'longitude': loc.coords.longitude,
                        'last_update': Date.now(),
                        ->
                    )
            ), ((err) -> 
                console.log "Geolocation Error:"
                @errHandler err
                chrome.storage.local.set 'last_update': Date.now(), ->
            ), ->
        else
            console.log 'Geolocation unavailable'

module.exports = obj
