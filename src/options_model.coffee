'use strict'

#
# helpers
#
$ = document.querySelector.bind document
$$ = document.querySelectorAll.bind document
val = (obj) -> obj.value
last = (arr) -> arr[arr.length-1] if arr.length > 0

M = require './keyframes.coffee'
C = require './color_helpers.coffee'

class Options
    constructor: (@kfs=[], @kfviews=[], @mode='auto', @color={}) ->
        chrome.runtime.sendMessage type: 'init_options', (resp) =>
            @mode = resp.mode
            @color = resp.color

            $ '#color'
                .value = C.rgb_to_hex resp.color

            $ '#mode'
                .checked = @mode is 'auto'
            @toggle_slides()

            @add kf for kf in resp.kfs.sort (a, b) -> a.altitude - b.altitude

        $ '#add'
            .addEventListener 'click', (event) =>
                event.preventDefault()
                @add()

        self = this

        $ '#save'
            .addEventListener 'click', (event) ->
                event.preventDefault()
                chrome.runtime.sendMessage {
                    type: 'set',
                    kfs: self.kfs
                }, (resp) =>
                    if resp
                        state = 'button-success'
                        html = 'saved!'
                    else
                        state = 'button-failure'
                        html = 'failed!'

                    @classList.add state
                    @innerHTML = html

                    window.setTimeout (=>
                        @classList.remove state
                        @innerHTML = 'save'
                    ), 1000

        $ '#color'
            .addEventListener 'input', (event) ->
                event.preventDefault()
                self.color = C.hex_to_rgb @value
                chrome.runtime.sendMessage {
                    type: 'set',
                    color: self.color
                }

        $ '#mode'
            .addEventListener 'click', (event) ->
                self.mode = if @checked then 'auto' else 'manual'
                chrome.runtime.sendMessage {
                    type: 'set',
                    mode: self.mode
                }, (resp) =>
                    if not chrome.runtime.lastError?
                        self.toggle_slides()
                    else
                        console.log 'ERROR when setting mode!'
                        console.log chrome.runtime.lastError

    toggle_slides: ->
        $ '#auto'
            .classList.toggle 'active', @mode is 'auto'
        $ '#manual'
            .classList.toggle 'active', @mode is 'manual'

    add: (model) ->
        model = new M.Keyframe() if not model?
        @kfs.push model
        @kfviews.push new M.KeyframeView model, $ '#keyframes'

        last @kfviews
            .create()
            .render()
            .delete.addEventListener 'click', (event) =>
                event.preventDefault()
                index = @kfs.indexOf model
                @kfs.splice index, 1
                last @kfviews.splice index, 1
                    .erase()

module.exports = Options
