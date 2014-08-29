helpers = 
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

    get: (kfs, type, altitude) ->
        kfs = kfs
                .filter (el) -> el.option is type

        if kfs.length is 0
            return 0

        kfs.sort (a, b) -> a.key_value - b.key_value

        idx = kfs
                .filter (el) -> el.key_value < altitude
                .length

        @linear_interpolate(
            altitude, 
            kfs[if idx isnt 0 then idx-1 else kfs.length-1].key_value,
            kfs[if idx isnt 0 then idx-1 else kfs.length-1].value,
            kfs[if idx isnt kfs.length then idx else 0].key_value,
            kfs[if idx isnt kfs.length then idx else 0].value
        )

    linear_interpolate: (value, key1, val1, key2, val2) ->
        if key2 is key1
            val1
        else
            val1 + (val2 - val1) * (value - key1) / (key2 - key1) 

    contains: (val, arr) -> arr.some (el) -> el is val

module.exports = helpers
