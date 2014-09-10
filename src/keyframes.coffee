'use strict'

C = require './color_helpers.coffee'
H = require './helpers.coffee'

if HTMLElement?
    HTMLElement.prototype.set = (attr, val) ->
        @[attr] = val
        @

obj = 
    AKeyframe:
        class AKeyframe
            constructor: (
                @altitude=0,
                @option='temperature',
                @value=2700,
                @direction=0) ->

    TKeyframe:
        class TKeyframe
            constructor: (
                @time=[0, 0], #hours, minutes
                @option='temperature',
                @value=2700) ->

    KeyframeView:
        class KeyframeView
            constructor: (@model, @parent, @keymode) ->

            option_map:
                opacity: 'number',
                temperature: 'number',
                color: 'color'

            direction_map:
                asc: 1,
                desc: -1,
                both: 0

            option_defaults:
                opacity: 0.5,
                temperature: 2700,
                color: '#ffffff'

            key_defaults:
                alt: 0,
                time: [0, 0]

            create: ->
                @altitude = document.createElement 'input'
                    .set 'type', 'number'
                    .set 'value', @model.altitude
                @altitude.classList.add 'key-input'

                @option = document.createElement 'select'
                @option.classList.add 'option-input'
                for opt in [ 'color', 'temperature', 'opacity']
                    do (opt) =>
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
                    do (opt) =>
                        @direction
                            .appendChild document.createElement 'option'
                                .set 'innerHTML', opt
                                .set 'selected', (true if @direction_map[opt] is @model.direction)

                @delete = document.createElement 'button'
                    .set 'innerHTML', '-'
                @delete.classList.add 'delete', 'button'

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
                                    self.model[input] = self.direction_map[@value]
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

    get_color: (kfs, keymode, alt, dir, min, max) ->
        kfs.filter (kf) -> kf[keymode]?

        for kf in kfs
            do (kf) ->
                if kf.option is 'temperature'
                    kf.option = 'color'
                    kf.value = C.temp_to_rgb kf.value

        if kfs.length is 0
            return null
        else if kfs.length is 1
            return kfs[0].value

        if keymode is 'altitude'
            kfs.sort (a, b) -> a.altitude - b.altitude
        else
            kfs.sort (a, b) -> a.time[0]*60+a.time[1] - b.time[0]*60+b.time[1]

        last = @_get_last_kf kfs, keymode, alt, dir
        next = @_get_next_kf kfs, keymode, alt, dir

        if next is last
            return last.value

        H.interpolate keymode, alt, dir, last, next, min, max

    _get_last_kf: (kfs, keymode, alt, dir) ->
        if keymode is 'altitude'
            # keyframes of same direction since last direction change
            cands = kfs.filter (kf) -> kf.direction * dir >= 0 and (alt - kf.altitude)*dir >= 0

            if cands.length > 0
                return if dir is 1 then H.last(cands) else cands[0]

            # keyframes of opposite direction, thus before last direction change
            cands = kfs.filter (kf) -> kf.direction*dir <= 0

            return if dir is 1 then cands[0] else H.last cands
        else
            date = new Date()
            cands = kfs.filter (kf) ->
                kf.time[0] < date.getHours() or
                    (kf.time[0] is date.getHours() and kf.time[1] < date.getMinutes())

            if cands.length > 0
                return last cands

            return last kfs

    _get_next_kf: (kfs, keymode, alt, dir) ->
        if keymode is 'altitude'
            # keyframes of same direction before next direction change
            cands = kfs.filter (kf) -> kf.direction * dir >= 0 and (kf.altitude - alt)*dir > 0

            if cands.length > 0
                return if dir is 1 then cands[0] else H.last cands

            # keyframes of opposite dir, thus after next dir change
            cands = kfs.filter (kf) -> kf.direction*dir <= 0

            return if dir is 1 then H.last(cands) else cands[0]
        else
            date = new Date()
            cands = kfs.filter (kf) ->
                kf.time[0] > date.getHours() or
                (kf.time[0] is date.getHours and date.getMinutes() > kf.time[1])

            if cands.length > 0
                return cands[0]

            return kfs[0]

    # app logic
    choose_color: (it) ->
        if it.mode is 'manual'
            return it.color
        else
            return @get_color it.kfs, it.keymode, it.alt, it.dir, it.min, it.max


module.exports = obj
