'use strict'

helpers = 
    $: (id) -> document.querySelector id if document?
    $$: (className) -> document.querySelectorAll className if document?

    # suppose max - min is the size of interval (one cycle)
    between: (min, max, val) ->
        while val < min
            val += max - min
        while max <= val
            val -= max - min
        val

    angleToQuadrant: (angle) ->
        angle = @between 0, 360, angle
        if angle < 90 then 1
        else if angle < 180 then 2
        else if angle < 270 then 3
        else if angle < 360 then 4

    to_radians: (angle) -> angle * Math.PI / 180
    to_angle: (rad) -> rad * 180 / Math.PI

    angle_sin: (x) -> Math.sin @to_radians x
    angle_cos: (x) -> Math.cos @to_radians x
    angle_tan: (x) -> Math.tan @to_radians x
    angle_atan: (x) -> @to_angle Math.atan x
    angle_asin: (x) -> @to_angle Math.asin x

    # direction change since last kf means we passed a solar noon or midnight
    # since last kf; this means we have to calculate t (abs. difference in
    # altitude between keyframes, etc) via this wave crest / wave through
    interpolate: (keymode, alt, dir, kf1, kf2, min, max) ->
        if keymode is 'altitude'
            # kfs in same direction
            if kf1.direction * kf2.direction >= 0
                # we are between kfs of same direction
                if dir * kf1.direction >= 0
                    t = (alt - kf1.altitude) / (kf2.altitude - kf1.altitude)
                # last kf was before previous direction change;
                # next is after next direction change
                else
                    # t must be calculated over the curve top (via sun noon or midnight)
                    if dir
                        # we are ascending, both keyframes are descending
                        t = (alt + kf1.altitude - 2*min) / (2 * (max-min) - (kf2.altitude - kf1.altitude))
                    else
                        # we are descending, both keyframes are ascending
                        t = (2*max - alt - kf1.altitude) / (2 * (max-min) - (kf1.altitude - kf2.altitude))
            else
                # kfs of opposite directions
                if dir * kf1.direction >= 0
                    # no direction change since last kf
                    if dir is 1
                        t = (alt - kf1.altitude) / (2*max - kf1.altitude - kf2.altitude)
                    else
                        t = (kf1.altitude - alt) / (kf1.altitude + kf2.altitude - 2*min)
                else
                    if dir is 1
                        t = (kf1.altitude + alt - 2*min) / (kf1.altitude + kf2.altitude - 2*min)
                    else
                        t = (2*max - kf1.altitude - alt) / (2*max - kf1.altitude - kf2.altitude)
        else
            now = new Date()
            delta_minutes = kf2.time[0]*60+kf2.time[1] - kf1.time[0]*60+kf1.time[1]
            delta_minutes += 24*60 if delta_minutes < 0

            minutes_since_last = now.getHours()*60+now.getMinutes() - kf1.time[0]*60-kf1.time[1]
            minutes_since_last += 24*60 if minutes_since_last < 0

            t = minutes_since_last / delta_minutes

        if kf1.option is 'color'
            return @_interpolate_colors kf1.value, kf2.value, t
        else if kf1.option is 'opacity'
            return (t * kf2.value + (1-t) * kf1.value).toFixed 0

     # t as in parametrics: t*rgb1 + (1-t)rgb2 -> result
    _interpolate_colors: (rgb1, rgb2, t) -> 
        rgb = {}
        for attr in ['r', 'g', 'b']
            do ->
                rgb[attr] = (t * rgb2[attr] + (1-t) * rgb1[attr]).toFixed 0
        rgb

    contains: (val, arr) -> arr.some (el) -> el is val
    last: (arr) -> if arr.length > 0 then arr[arr.length-1] else null
    max: (arr) ->
        max = arr[0]
        for val in arr
            do ->
                max = val if val > max
        max

    min: (arr) ->
        -@max (-val for val in arr)

module.exports = helpers
