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

    interpolate: (value, key1, val1, key2, val2) ->
        if key2 is key1
            val1
        else
            val1 + (val2 - val1) * (value - key1) / (key2 - key1) 

    contains: (val, arr) -> arr.some (el) -> el is val

module.exports = helpers
