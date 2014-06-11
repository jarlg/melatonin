obj = 
    get_color: (temperature) ->
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
