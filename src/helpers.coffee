helpers = 
    between: (min, max, ref) ->
        while ref < min
            ref += 360
        while max < ref
            ref -= 360
        ref

    angleToQuadrant: (angle) ->
        if 0 < angle and angle < 90 then 1
        else if angle < 180 then 2
        else if angle < 270 then 3
        else if angle < 360 then 4

    to_radians: (angle) -> angle * Math.PI / 180
    to_angle: (rad) -> rad * 180 / Math.PI

    angle_sin: (x) -> Math.sin to_radians x
    angle_cos: (x) -> Math.cos to_radians x
    angle_tan: (x) -> Math.tan to_radians x
    angle_atan: (x) -> to_angle Math.atan x
    angle_asin: (x) -> to_angle Math.asin x

module.exports = helpers
