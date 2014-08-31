'use strict'

# taken from http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
obj =
    rgb_to_hex: (rgb) ->
        if rgb? and rgb.r? and rgb.g? and rgb.g?
            "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)
        else
            null

    hex_to_rgb: (hex) ->
        #Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
        hex = hex.replace shorthandRegex, (m, r, g, b) -> r + r + g + g + b + b
        result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        if result
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        else
            null

    rgb_to_string: (rgb) ->
        if rgb?
            return String(rgb.r) + ", " + String(rgb.g) + ", " + String(rgb.b)
        else
            return "255, 255, 255"

    temp_to_rgb: (temperature) ->
        temp = temperature / 100
    
        if temp <= 66
            red = 255
            green = temp
            green = 99.4708025861 * Math.log(green) - 161.1195681661
    
            if temp <= 19
                blue = 0
            else 
                blue = temp-10
                blue = 138.5177312231 * Math.log(blue) - 305.0447927307
        else 
            red = temp - 60
            red = 329.698727446 * Math.pow(red, -0.1332047592)
            green = temp - 60
            green = 288.1221695283 * Math.pow(green, -0.0755148492)
            blue = 255
    
        r : if red   < 0 then 0 else if red   > 255 then 255 else red.toFixed(0),
        g : if green < 0 then 0 else if green > 255 then 255 else green.toFixed(0),
        b : if blue  < 0 then 0 else if blue  > 255 then 255 else blue.toFixed(0)

module.exports = obj
