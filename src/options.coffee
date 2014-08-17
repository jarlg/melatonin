$ = document.querySelector.bind document
$$ = document.querySelectorAll.bind document
val = (obj) -> obj.value

defaults =
    sun_altitude: 0,
    time: '00:00',
    color_temperature: 2700

$ '#add-keyframe'
    .addEventListener 'click', (event) =>
        event.preventDefault()
        newKeyframe()

addTriggerInput = (trigger) ->
    input = document.createElement 'input'
    if 'altitude' is val $ '#key-type'
        input.type = 'number'
        input.value = defaults.sun_altitude
        trigger.innerHTML = 'deg: '
    else
        input.type = 'time'
        input.value = defaults.time
    trigger.appendChild input

newKeyframe = ->
    row = document.createElement 'tr'
    #
    # trigger
    #
    trigger = document.createElement 'th'
    trigger.addClass 'keyframe-trigger'
    row.appendChild trigger

    #
    # option
    #
    option = document.createElement 'th'
    select = document.createElement 'select'

    option1 = document.createElement 'option'
    option1.value = 'color'
    option1.innerHTML = option1.value

    option2 = document.createElement 'option'
    option2.value = 'color temperature'
    option2.innerHTML = option2.value
    option2.selected = true

    option3 = document.createElement 'option'
    option3.value = 'opacity'
    option3.innerHTML = option3.value

    select.appendChild option1
    select.appendChild option2
    select.appendChild option3

    option.appendChild select
    row.appendChild option

    #
    # value
    # 
    value = document.createElement 'th'
    input = document.createElement 'input'
    input.type = 'number'

    value.appendChild input
    row.appendChild value

    $ '#keyframes'
        .appendChild row
