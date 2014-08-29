H = require './helpers.coffee'

# taken from http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
obj =
    rgb_to_hex: (rgb) ->
        "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)
        
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

    rgb_to_string: (rgb) -> rgb.r + ", " + rgb.g + ", " + rgb.b

    # get automatic opacity from keyframes
    get_atm_opac: (cb) ->
        chrome.storage.local
            .get ['keyframes', 'altitude'], (items) ->
                cb H.get items.keyframes, 'opacity', items.altitude

module.exports = obj
