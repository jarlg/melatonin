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
        console.log 'created KFTable'
        @

    kfs: [],
    views: [],

    add: (kf) ->
        if not kf?
            if @keymode is 'altitude'
                kf = new K.AKeyframe()
            else
                kf = new K.TKeyframe()

        console.log 'added alt kf: %s', kf.altitude?
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
                event.preventDefault()
                @views[idx].erase()
                @kfs.splice @kfs.indexOf @views[idx].model

    clear: ->
        view.erase() for view in @views
        @views.length = 0

    create: ->
        console.log 'creating KFTable'
        @head_tr = document.createElement 'tr'

        @keymode_input = document.createElement 'select'

        for opt in ['altitude', 'time']
            do =>
                @keymode_input.appendChild document.createElement 'option'
                    .set 'innerHTML', opt
                    .set 'selected', (true if opt is @keymode)

        self = this
        @keymode_input.addEventListener 'input', (event) ->
            event.preventDefault()
            self.keymode = @value
            console.log 'clearing'
            self.clear()
            console.log self.views
            for kf in self.kfs
                do (kf) =>
                    console.log kf
                    console.log kf[@value]?
                    if kf[@value]?
                        self.createView kf

            self.render()

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
            event.preventDefault()
            @add()
            @table.appendChild last(@views).render().row

        @head_tr.appendChild document.createElement 'th'
            .appendChild @add_button

        @save_button = document.createElement 'button'
            .set 'id', 'save'
            .set 'innerHTML', 'save'
        @save_button.classList.add 'button'

        @save_button.addEventListener 'click', (event) =>
            event.preventDefault()
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

        console.log 'added EventListeners'
        @

    render: ->
        console.log 'rendering KFTable'
        # clear table
        @table.removeChild @head_tr if @head_tr.parentNode is @table
        console.log 'removed head_tr'

        if @views.length > 0
            console.log @views.length
            console.log @views
            for kf in @views
                do =>
                    if kf.row.parentNode is @table
                        @table.removeChild kf.row

        console.log 'removed views'
        @table.parentNode.removeChild @save_button if @save_button.parentNode is @table.parentNode
        console.log 'removed save button'

        console.log 'cleared parent..'

        @table.appendChild @head_tr
        console.log 'rendered tr'
        kf.render() for kf in @views

        @table.appendChild kf.row for kf in @views

        @table.parentNode.appendChild @save_button
        @


class Options
    constructor: ->
        chrome.runtime.sendMessage type: 'init_options', (resp) =>
            @mode = resp.mode
            @color = resp.color
            console.log 'got keymode %s', resp.keymode
            @table = new KFTable $('#keyframes'), resp.keymode

            @table.add kf for kf in resp.kfs
            @table.create()
                .render()

            $ '#color'
                .value = C.rgb_to_hex resp.color

            $ '#mode'
                .checked = @mode is 'auto'
            @toggle_slides()

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
