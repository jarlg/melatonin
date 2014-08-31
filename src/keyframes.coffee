'use strict'

C = require './color_helpers.coffee'

if HTMLElement?
    HTMLElement.prototype.set = (attr, val) ->
        @[attr] = val
        @

Models = 
    Keyframe:
        # model
        class Keyframe
            constructor: (
                @key_type='altitude',
                @key_value=0,
                @option='temperature',
                @value=2700) ->

    KeyframeView:
        class KeyframeView
            constructor: (@model, @parent) ->

            option_map:
                opacity: 'number',
                temperature: 'number',
                color: 'color'

            create: ->
                @row = document.createElement 'tr'
                @row.classList.add 'keyframe'

                @key_value = document.createElement 'input'
                    .set 'type', 'number'
                    .set 'value', @model.key_value

                @key_value.classList.add 'key-input'

                @option = document.createElement 'select'

                for opt in [ 'color', 'temperature', 'opacity' ]
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

                @delete = document.createElement 'button'
                    .set 'innerHTML', '-'
                @delete.classList.add 'delete'

                for input in ['key_value', 'option', 'value', 'delete']
                    do (input) =>
                        @row
                            .appendChild document.createElement 'th'
                            .appendChild @[input]
                        if input isnt 'delete'
                            self = this
                            @[input].addEventListener 'input', (event) ->
                                if @type is 'color'
                                    self.model[input] = C.hex_to_rgb @value
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


module.exports = Models
