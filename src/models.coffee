'use strict'

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
            constructor: (@model, @parent, @controller) ->

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

                @option = document.createElement 'select'

                for opt in [ 'color', 'temperature', 'opacity' ]
                    do =>
                        @option
                            .appendChild document.createElement 'option'
                                .set 'innerHTML', opt
                                .set 'selected', (true if opt is @model.option)

                @value = document.createElement 'input'
                    .set 'value', @model.value

                @setValueType()
                @option.addEventListener 'input', @setValueType.bind @

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
                                self.model[input] = @value

                @

            setValueType: ->
                @value.type = @option_map[@option.value]
                @value.value = @model.value

            render: -> @parent.appendChild @row; @

            erase:  -> @parent.removeChild @row; @


module.exports = Models