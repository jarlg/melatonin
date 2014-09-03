'use strict'

C = require './color_helpers.coffee'
H = require './helpers.coffee'

if HTMLElement?
    HTMLElement.prototype.set = (attr, val) ->
        @[attr] = val
        @

obj = 
    Keyframe:
        # model
        class Keyframe
            constructor: (
                @altitude=0,
                @option='temperature',
                @value=2700,
                @direction=0) ->

    KeyframeView:
        class KeyframeView
            constructor: (@model, @parent) ->

            option_map:
                temperature: 'number',
                color: 'color'

            direction_map:
                asc: 1
                desc: -1
                both: 0

            create: ->
                @row = document.createElement 'tr'
                @row.classList.add 'keyframe'

                @altitude = document.createElement 'input'
                    .set 'type', 'number'
                    .set 'value', @model.altitude
                @altitude.classList.add 'key-input'

                @option = document.createElement 'select'
                @option.classList.add 'option-input'
                for opt in [ 'color', 'temperature']
                    do =>
                        @option
                            .appendChild document.createElement 'option'
                                .set 'innerHTML', opt
                                .set 'selected', (true if opt is @model.option)

                @value = document.createElement 'input'
                @value.classList.add 'value-input'

                @set_value_type()
                @set_value_value()

                @option.addEventListener 'input', =>
                    @set_value_type()
                    @set_value_value()

                @direction = document.createElement 'select'
                @direction.classList.add 'direction-input'
                for opt in ['asc', 'desc', 'both']
                    do =>
                        @direction
                            .appendChild document.createElement 'option'
                                .set 'innerHTML', opt
                                .set 'selected', (true if @direction_map[opt] is @model.direction)

                @delete = document.createElement 'button'
                    .set 'innerHTML', '-'
                @delete.classList.add 'delete', 'pure-button'

                for input in ['altitude', 'option', 'value', 'direction', 'delete']
                    do (input) =>
                        @row
                            .appendChild document.createElement 'th'
                            .appendChild @[input]
                        if input isnt 'delete'
                            self = this
                            @[input].addEventListener 'input', (event) ->
                                if @type is 'color'
                                    self.model[input] = C.hex_to_rgb @value
                                else if input is 'direction'
                                    self.model[input] = @direction_map[@value]
                                else
                                    self.model[input] = @value
                @

            set_value_type: ->
                @value.type = @option_map[@option.value]
                if @value.type is 'color'
                    @value.classList.add 'color-input'
                else
                    @value.classList.remove 'color-input'

            set_value_value: ->
                @value.value = if @value.type is 'color' then C.rgb_to_hex(@model.value) else @model.value

            render: -> @parent.appendChild @row; @

            erase:  -> @parent.removeChild @row; @

    get_color: (kfs, alt, dir, min, max) ->
        for kf in kfs
            do (kf) ->
                if kf.option is 'temperature'
                    kf.option = 'color'
                    kf.value = C.temp_to_rgb kf.value

        if kfs.length is 0
            return null
        else if kfs.length is 1
            return kfs[0].value

        kfs.sort (a, b) -> a.altitude - b.altitude

        last = @_get_last_kf kfs, alt, dir
        next = @_get_next_kf kfs, alt, dir

        H.interpolate alt, dir, last, next, min, max

    _get_last_kf: (kfs, alt, dir) ->
        # keyframes of same direction since last direction change
        cands = kfs.filter (kf) -> kf.direction * dir >= 0 and (alt - kf.altitude)*dir >= 0

        if cands.length > 0
            return if dir is 1 then H.last(cands) else cands[0]

        # keyframes of opposite direction, thus before last direction change
        cands = kfs.filter (kf) -> kf.direction is -dir

        return if dir is 1 then cands[0] else H.last cands

    _get_next_kf: (kfs, alt, dir) ->
        # keyframes of same direction before next direction change
        cands = kfs.filter (kf) -> kf.direction * dir >= 0 and (kf.altitude - alt)*dir > 0

        if cands.length > 0
            return if dir is 1 then cands[0] else H.last cands

        # keyframes of opposite dir, thus after next dir change
        cands = kfs.filter (kf) -> kf.direction is -dir

        return if dir is 1 then H.last(cands) else cands[0]

    # app logic
    choose_color: (it) ->
        if it.mode is 'manual'
            return it.color
        else
            return @get_color it.kfs, it.alt, it.dir, it.min, it.max


module.exports = obj
