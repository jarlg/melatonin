'use strict'

H = require './helpers.coffee'
A = require './altitude.coffee'
C = require './color_helpers.coffee'

obj =
    with_color: (cb) ->
        console.log 'getting from storage...'
        chrome.storage.local.get [
            'on'
            'custom_color'
            'color'
            'custom_opacity'
            'opacity'
            'latitude'
            'longitude'
            'keyframes'
        ], (it) =>
            if not it.on
                return cb 0, null

            if it.custom_color
                color = it.color
            else
                color = @_get_kf_color it.keyframes, it.latitude, it.longitude

            if it.custom_opacity
                opacity = it.opacity
            else
                opacity = @_get_kf_opacity it.keyframes, it.latitude, it.longitude

            cb opacity, color

    _get_kf_color: (kfs, lat, long) ->
        for kf in kfs
            do (kf) ->
                if kf.option is 'temperature'
                    kf.option = 'color'
                    kf.value = C.temp_to_rgb kf.value

        H.get kfs, 'color', A.get_altitude new Date(), lat, long

    _get_kf_opacity: (kfs, lat, long) ->
        H.get kfs, 'opacity', A.get_altitude new Date(), lat, long

module.exports = obj
