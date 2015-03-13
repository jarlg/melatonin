'use strict'

K = require './keyframes.coffee'
C = require './color_helpers.coffee'
H = require './helpers.coffee'

class KFTable
    constructor: (@table, @keymode) ->

    kfs: [],
    views: [],

    add: (kf) ->
        if not kf?
            if @keymode is 'altitude'
                kf = new K.AKeyframe()
            else
                kf = new K.TKeyframe()

        @kfs.push kf
        if kf[@keymode]?
            @create_view kf

    create_view: (kf) ->
        row = document.createElement 'tr'
        row.classList.add 'keyframe'
        view = new K.KeyframeView kf, row, @keymode
        @views.push view
        view.create()
            .delete.addEventListener 'click', (event) =>
                event.preventDefault()
                v_idx = @views.indexOf view
                @kfs.splice @kfs.indexOf(@views[v_idx].model), 1
                @views[v_idx].erase()
                @views.splice v_idx, 1

    clear_header: ->
        @head_tr.parentNode.removeChild @head_tr if @head_tr.parentNode?
        @

    clear_kfs: ->
      @kfs.length = 0
      @clear_views()
      @

    clear_views: ->
        if @views.length > 0
            view.erase() for view in @views
            @views.length = 0
        @

    create_header: ->
        @head_tr = document.createElement 'tr'

        @head_tr.appendChild document.createElement 'th'
            .appendChild @keymode_input

        for title in ['option', 'value', 'direction']
            do =>
                if title isnt 'direction' or @keymode isnt 'time'
                    @head_tr.appendChild document.createElement 'th'
                        .set 'innerHTML', chrome.i18n.getMessage title

        @head_tr.appendChild document.createElement 'th'
            .appendChild @add_button

        @

    create: ->
        @keymode_input = document.createElement 'select'

        for opt in ['altitude', 'time']
            do =>
                @keymode_input.appendChild document.createElement 'option'
                    .set 'innerHTML', chrome.i18n.getMessage opt
                    .set 'selected', (true if opt is @keymode)

        self = this
        @keymode_input.addEventListener 'input', (event) ->
            event.preventDefault()
            self.keymode = @value
            self.clear_views()
            for kf in self.kfs
                do (kf) =>
                    if kf[@value]?
                        self.create_view kf
            self.clear_header()
            self.create_header()
            self.render()

        @add_button = document.createElement 'button'
            .set 'id', 'add'
            .set 'innerHTML', '+'
        @add_button.classList.add 'button'

        @add_button.addEventListener 'click', (event) =>
            event.preventDefault()
            @add()
            @table.appendChild H.last(@views).render().row

        H.$ '#save' 
            .addEventListener 'click', (event) ->
                event.preventDefault()
                chrome.runtime.sendMessage {
                    type: 'set',
                    kfs: self.kfs,
                    keymode: self.keymode
                }, =>
                    if not chrome.runtime.lastError?
                        state = 'button-success'
                        html = chrome.i18n.getMessage 'saved'
                    else
                        state = 'button-failure'
                        html = chrome.i18n.getMessage 'failed'

                    @classList.add state
                    @innerHTML = html

                    window.setTimeout (=>
                        @classList.remove state
                        @innerHTML = chrome.i18n.getMessage 'save'
                    ), 1000

        @create_header()
        @

    render: ->
        @table.appendChild @head_tr
        view.render() for view in @views

        @table.appendChild view.row for view in @views
        @


class Options
    constructor: ->
        chrome.runtime.sendMessage type: 'init_options', (resp) =>
            @mode = resp.mode
            @color = resp.color
            @table = new KFTable H.$('#keyframes'), resp.keymode

            @table.add kf for kf in resp.kfs
            @table.create()
                .render()

            H.$ '#color'
                .value = C.rgb_to_hex resp.color

            H.$ '#mode'
                .checked = @mode is 'auto'

            H.$ '#auto_opac-toggle'
                .checked = resp.auto_opac

            @toggle_slides()

        @port = chrome.runtime.connect name: 'options'
        @port.onMessage.addListener (msg) ->
            if msg.type is 'set auto_opac'
                H.$ '#auto_opac-toggle'
                    .checked = msg.value

        self = this
        H.$ '#color'
            .addEventListener 'input', (event) ->
                event.preventDefault()
                self.color = C.hex_to_rgb @value
                chrome.runtime.sendMessage {
                    type: 'set',
                    color: self.color
                }, ->
                    if chrome.runtime.lastError?
                        console.log 'ERROR when setting color!!'
                        console.log chrome.runtime.lastError


        H.$ '#mode'
            .addEventListener 'click', (event) ->
                self.mode = if @checked then 'auto' else 'manual'
                chrome.runtime.sendMessage {
                    type: 'set',
                    mode: self.mode
                }, ->
                    if not chrome.runtime.lastError?
                        self.toggle_slides()
                    else
                        console.log 'ERROR when setting mode!'
                        console.log chrome.runtime.lastError

        H.$ '#auto_opac-toggle'
            .addEventListener 'click', (event) ->
                chrome.runtime.sendMessage {
                    type: 'set', 
                    auto_opac: @checked
                }, ->
                    if chrome.runtime.lastError?
                        console.log 'ERROR when setting auto_opac!!'
                        console.log chrome.runtime.lastError
        
        H.$ '#export'
          .addEventListener 'click', =>
            # show EXPORT dialog
            H.$ '#dialog'
              .style.visibility = "visible"

            H.$ '#dialog-json'
              .value = JSON.stringify @table.kfs

        H.$ '#import'
          .addEventListener 'click', =>
            H.$ '#dialog'
              .style.visibility = "visible"

            for el in H.$$ '.import-dialog'
              do -> el.style.visibility = "visible"

        H.$ '#dialog-load'
          .addEventListener 'click', =>
            console.log "attempting to load json!"
            try
              kfs = JSON.parse H.$('#dialog-json').value
              console.log kfs
              if kfs.length? and kfs.length > 0
                @table.clear_kfs()
                @table.add kf for kf in kfs
                @table.render()
            catch e
              console.log 'failed parsing imported json'
              console.log e

        H.$ '#dialog-close'
          .addEventListener 'click', (ev) =>
            ev.stopPropagation()
            @clear_dialog()

        H.$ '#dialog'
          .addEventListener 'click', => @clear_dialog()

        H.$ '#dialog-json'
          .addEventListener 'click', (ev) -> ev.stopPropagation()

    mode: 'auto',
    color: {},

    toggle_slides: ->
        H.$ '#auto'
            .classList.toggle 'active', @mode is 'auto'
        H.$ '#manual'
            .classList.toggle 'active', @mode is 'manual'

    clear_dialog: ->
      H.$ '#dialog'
        .style.visibility = "hidden"

      for el in H.$$ '.import-dialog'
        do -> el.style.visibility = "hidden"

      H.$ '#dialog-json'
        .value = ""


window.onload = ->
    options = new Options()

    chrome.runtime.sendMessage type: 'request_feedback', ->

    # insert translated content
    H.$ '#automatic-color-label'
      .innerHTML = chrome.i18n.getMessage 'automatic_color'

    H.$ '#save'
      .innerHTML = chrome.i18n.getMessage 'save_button'

    H.$ '#dialog-close'
      .innerHTML = chrome.i18n.getMessage 'close'

    H.$ '#dialog-load'
      .innerHTML = chrome.i18n.getMessage 'load'

    H.$ '#export'
      .innerHTML = chrome.i18n.getMessage 'export'

    H.$ '#import'
      .innerHTML = chrome.i18n.getMessage 'import'

    H.$ '#automatic-options-description'
      .innerHTML = chrome.i18n.getMessage 'automatic_options_description'

    H.$ '#automatic-opacity-toggle'
      .innerHTML = chrome.i18n.getMessage 'automatic_opacity_toggle'

    H.$ '#automatic-opacity-warning'
      .innerHTML = chrome.i18n.getMessage 'automatic_opacity_warning'

    H.$ '#manual-options-description'
      .innerHTML = chrome.i18n.getMessage 'manual_options_description'

    H.$ '#options-notification'
      .innerHTML = chrome.i18n.getMessage 'options_notification'
