'use strict'

K = require './keyframes.coffee'
App = require './app.coffee'

# CONFIG
#
# mode: 'auto' means the overlay's color/temperature (and opacity) are
# controlled by keyframes. 'manual' means the user-specified color is used, and
# keyframes are disregarded.
#
# color: user specified color (otherwise color is calculated from keyframes)
#
# keymode: 'altitude'/'time' means keyframes are linked to resp. altitude/time
# values
# 
# min,max: stored values of resp. midnight/solar noon altitude values at
# geolocation of stored lat, long values
#
# dir: 1 for rising sun, -1 for descending
#
# auto_opac: opacity controlled by slider in the popup or keyframes (auto)
#
# kfs: keyframes that specify color/temperature/opacity progression of the
# overlay
#
# blendmode_notified keeps track of wheter or not we've notified the user that
# experimental web features isn't enabled (required for mix-blend-mode: "hard-light"
# which improves overlay contrast)

config = 
    ver: '0.3.2',
    last_update: 0,
    mode: 'auto', # or 'manual'
    keymode: 'altitude', # or 'time'
    alt: 0,
    lat: 0,
    long: 0,
    min: -90, # solar midnight altitude
    max: 90, # solar noon altitude
    dir: 1, # 1 -> asc, -1 -> desc
    color: null, # color is an rgb object
    auto_opac: true,
    opac: 0.5,
    kfs: [
        new K.AKeyframe 0, 'temperature', 4500, 1   # morning
        new K.AKeyframe 91, 'temperature', 6300, 0 # >90 -> noon (i.e. local max)
        new K.AKeyframe 0, 'temperature', 2700, -1  # evening
    ],
    blendmode_notified: false

app = new App config
