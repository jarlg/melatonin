'use strict'

K = require './keyframes.coffee'
App = require './app.coffee'

config = 
    ver: '0.3.0',
    last_update: 0,
    mode: 'auto', # or 'manual'
    alt: 0,
    dir: 'asc', # or 'desc'
    color: null, # color is an rgb object
    opac: 0.5,
    kfs: [
        new K.Keyframe 0, 'temperature', 2700, 0
        new K.Keyframe 90, 'temperature', 6300, 0
    ]

app = new App config
