S = require './sun_altitude.coffee'

obj =
    bind_storage_events: ->
        chrome.storage.onChanged.addListener (changes, namespace) ->
            for own key, val of changes
                do (key, val, namespace) ->
                    console.log 'storage key %s in namespace %s changed' +
                        ' from %s to %s', key, namespace, val.oldValue, val.newValue
                    if key is 'latitude' or key is 'longitude' and val.newValue?
                        chrome.storage.local.set(
                            'altitude': S.get_sun_altitude(
                                new Date(),
                                changes['longitude'].newValue,
                                changes['latitude'].newValue
                            ), ->
                        )

    overlay: (tab) ->
        chrome.tabs.sendMessage(
            tab.id,
            type: 'update_color'
        )

    overlay_all: ->
        chrome.tabs.query(
            {},
            (tabs) => @overlay tab for tab in tabs,
        )

    update_position: ->
        if navigator.geolocation?
            navigator.geolocation.getCurrentPosition ((loc) ->
                    chrome.storage.local.set(
                        'latitude': loc.coords.latitude,
                        'longitude': loc.coords.longitude,
                        'last_update': Date.now(),
                        -> console.log "updated location"
                    )
            ), (error) -> console.log error,
                ->
        else
            console.log 'geolocation unavailable'

module.exports = obj
