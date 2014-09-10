'use strict'

#
# helpers
#
$ = document.querySelector.bind document
$$ = document.querySelectorAll.bind document
val = (obj) -> obj.value
last = (arr) -> arr[arr.length-1] if arr.length > 0

K = require './keyframes.coffee'
C = require './color_helpers.coffee'

class KFTable
    constructor: (@table, @keymode) ->

    kfs: [],
    views: [],

    # takes a model
    add: (kf) ->
        if not kf?
            if @keymode is 'altitude'
                kf = new K.AKeyframe()
            else
                kf = new K.TKeyframe()

        @kfs.push kf
        if kf[@keymode]?
            @createView kf

    createView: (kf) ->
        row = document.createElement 'tr'
        row.classList.add 'keyframe'
        @views.push new K.KeyframeView kf, row, @keymode
        idx = @views.length - 1
        @views[idx]
            .create()
            .delete.addEventListener 'click', (event) =>
                @views[idx].parent.parendNode.removeChild @views[idx].parent
                @kfs.splice @kfs.indexOf @views[idx].model

    clear: ->
        @views.length = 0

    create: ->
        @head_tr = document.createElement 'tr'

        @keymode_input = document.createElement 'select'

        for opt in ['altitude', 'time']
            do =>
                @keymode_input.appendChild document.createElement 'option'
                    .set 'innerHTML', opt
                    .set 'selected', (true if opt is @keymode)

        self = this
        @keymode_input.addEventListener 'input', (event) ->
            self.keymode = @value
            self.clear()
            self.createView kf for kf in self.kfs if kf[@value]?

        @head_tr.appendChild document.createElement 'th'
            .appendChild @keymode_input

        for title in ['option', 'value', 'direction']
            do =>
                if title isnt 'direction' or @keymode isnt 'time'
                    @head_tr.appendChild document.createElement 'th'
                        .set 'innerHTML', title

        @add_button = document.createElement 'button'
            .set 'id', 'add'
            .set 'innerHTML', '+'
        @add_button.classList.add 'button'

        @add_button.addEventListener 'click', (event) =>
            @add()
            last @views
                .render()

        @head_tr.appendChild document.createElement 'th'
            .appendChild @add_button

        @save_button = document.createElement 'button'
            .set 'id', 'save'
        @save_button.classList.add 'button'

        @save_button.addEventListener 'click', (event) =>
            chrome.runtime.sendMessage {
                type: 'set',
                kfs: self.kfs,
                keymode: self.keymode
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

    render: ->
        # clear table
        @table.removeChild @head_tr
        @table.removeChild kf.parent for kf in @views
        @table.removeChild @save_button

        @table.appendChild @head_tr
        kf.render() for kf in @views

        @table.appendChild @save_button


class Options
    constructor: ->
        chrome.runtime.sendMessage type: 'init_options', (resp) =>
            @mode = resp.mode
            @color = resp.color
            @table = new KFTable $('#keyframes'), resp.keymode

            $ '#color'
                .value = C.rgb_to_hex resp.color

            $ '#mode'
                .checked = @mode is 'auto'
            @toggle_slides()

            @table.add kf for kf in resp.kfs.sort (a, b) -> a.altitude - b.altitude

        self = this
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

    mode: 'auto',
    color: {},

    toggle_slides: ->
        $ '#auto'
            .classList.toggle 'active', @mode is 'auto'
        $ '#manual'
            .classList.toggle 'active', @mode is 'manual'


module.exports = Options
