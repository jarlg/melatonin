'use strict'

K = require './keyframes.coffee'
App = require './app.coffee'

config = 
    ver: '0.3.0',
    last_update: 0,
    mode: 'auto', # or 'manual'
    alt: 0,
    lat: 0,
    long: 0,
    min: -90, 
    max: 90, # solar noon altitude
    dir: 1, # 1 -> asc, -1 -> desc
    color: null, # color is an rgb object
    opac: 0.5,
    kfs: [
        new K.Keyframe 0, 'temperature', 2700, 0
        new K.Keyframe 90, 'temperature', 6300, 0
    ]

app = new App config
