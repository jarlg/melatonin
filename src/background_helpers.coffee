S = require './sun_altitude.coffee'
T = require './temperature_to_color.coffee'
C = require './color_helpers.coffee'
H = require './helpers.coffee'

contains = (val, arr) -> arr.some (el) -> el is val

obj =
    errHandler: (err) ->
        console.log err.stack or err

    overlay: (tab) ->
        if tab?
            chrome.tabs
                .sendMessage tab.id, type: 'update_color'
        else
            # could query out the active one..
            @overlay_all()

    overlay_all: ->
        chrome.tabs
            .query {}, (tabs) => @overlay tab for tab in tabs

    bind_storage_events: ->
        chrome.storage.onChanged.addListener (changes, namespace) =>
            for own key, val of changes
                do (key, val, namespace) =>
                    if key is 'last_update'
                        console.log 'updated %s from %s to %s (%smin)',
                            key, val.oldValue, val.newValue,
                            ((val.newValue - val.oldValue) / (1000 * 60)).toFixed 0
                    else
                        console.log 'updated %s from %s to %s',
                            key, val.oldValue, val.newValue
                    if key is 'last_update'
                        chrome.storage.local
                            .get ['longitude', 'latitude'], (items) =>
                                chrome.storage.local
                                    .set 'altitude': S.get_sun_altitude(
                                        new Date(),
                                        items.latitude,
                                        items.longitude
                                    ), ->
                    else if contains key, ['altitude', 'keyframes']
                        @update_temperature()
                    else if key is 'temperature'
                        chrome.storage.local
                            .set 'rgb': C.rgb_to_string(T.get_color val.newValue), ->
                    else if contains key, ['rgb', 'custom', 'custom_color']
                        @overlay_all()
                    else if key is 'opacity'
                        @overlay()
                    else if key is 'on'
                        if val.newValue is true
                            @update_position()
                        @overlay_all()
                    else if key is 'idle_state'
                        if val.newValue is 'active'
                            console.log 'went from idle to active. updating.'
                            @update_position()

    # interpolation between two keyframes with key_values
    # whose interval contain @altitude
    get_temperature: (altitude, keyframes) ->
        # only keyframes affecting color temperature,
        # sorted from lowest trigger altitude to highest
        kfs = keyframes
                .filter (kf) -> kf.option is 'temperature'
                .sort (a, b) -> a.key_value - b.key_value

        # keyframes[idx] corresponds to keyframe of 'upper interval',
        # kfs[idx-1] to lower
        idx = kfs
                .filter (kf) -> altitude > kf.key_value
                .length

        H.interpolate(
            altitude, 
            kfs[if idx isnt 0 then idx-1 else kfs.length-1].key_value,
            kfs[if idx isnt 0 then idx-1 else kfs.length-1].value,
            kfs[if idx isnt kfs.length then idx else 0].key_value,
            kfs[if idx isnt kfs.length then idx else 0].value
        )

    update_temperature: ->
        chrome.storage.local
            .get ['altitude', 'keyframes'], (items) =>
                temp = @get_temperature items.altitude, items.keyframes
                if temp?
                    chrome.storage.local
                        .set 'temperature': temp, ->

    update_position: ->
        if navigator.geolocation?
            navigator.geolocation
                .getCurrentPosition (loc) ->
                    chrome.storage.local
                        .set 'latitude': loc.coords.latitude
                            ,'longitude': loc.coords.longitude
                            ,'last_update': Date.now()
                            , ->
            , (err) -> 
                console.log "Geolocation Error:"
                @errHandler err
                chrome.storage.local.set 'last_update': Date.now(), ->
            , ->
        else
            console.log 'Geolocation unavailable'

module.exports = obj
