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
            constructor: (@model, @row, @keymode) ->

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
                console.log 'attempting to create %s kf', @keymode

                self = this
                if @keymode is 'altitude'
                    @altitude = document.createElement 'input'
                        .set 'type', 'number'
                        .set 'value', @model.altitude
                    @altitude.classList.add 'key-input'

                    @altitude.addEventListener 'input', (event) ->
                        self.model.altitude = @value

                else if @keymode is 'time'
                    @time_hours = document.createElement 'input'
                        .set 'type', 'number'
                        .set 'value', @model.time[0]
                    @time_mins = document.createElement 'input'
                        .set 'type', 'number'
                        .set 'value', @model.time[1]

                    @time_hours.addEventListener 'input', (event) ->
                        if @value < 0
                            @value = 0
                        else if @value > 24
                            @value = 24

                        self.model.time[0] = @value

                    @time_mins.addEventListener 'input', (event) ->
                        if @value < 0
                            @value = 0
                        else if @value > 60
                            @value = 60

                        self.model.time[1] = @value

                console.log 'done with key'

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

                @option.addEventListener 'input', ->
                    self.set_value_type()
                    self.set_value_value()
                    self.model.option = @value

                @value.addEventListener 'input', (event) ->
                    # put limits here? 
                    self.model.value = @value

                console.log 'done with options'

                if @keymode is 'altitude'
                    @direction = document.createElement 'select'
                    @direction.classList.add 'direction-input'
                    for opt in ['asc', 'desc', 'both']
                        do (opt) =>
                            @direction
                                .appendChild document.createElement 'option'
                                    .set 'innerHTML', opt
                                    .set 'selected', (true if @direction_map[opt] is @model.direction)

                    @direction.addEventListener 'input', (event) ->
                        self.model.direction = self.direction_map[@value]



                @delete = document.createElement 'button'
                    .set 'innerHTML', '-'
                @delete.classList.add 'delete', 'button'
                # delete's event listener is created by option controller
                @

            set_value_type: ->
                @value.type = @option_map[@option.value]
                if @value.type is 'color'
                    @value.classList.add 'color-input'
                else
                    @value.classList.remove 'color-input'

            set_value_value: ->
                @value.value = if @value.type is 'color' then C.rgb_to_hex(@model.value) else @model.value

            render: -> 
                if @keymode is 'altitude'
                    inputs = ['altitude', 'option', 'value', 'direction', 'delete']
                else
                    @row
                        .appendChild document.createElement 'td'
                        .appendChild @time_hours
                        .parentNode.appendChild @time_mins

                    inputs = ['option', 'value', 'delete']

                for input in inputs
                    do (input) =>
                        if @[input]?
                            @row
                                .appendChild document.createElement 'td'
                                .appendChild @[input]
                return @

            erase:  -> @row.parentNode.removeChild @row; @

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
