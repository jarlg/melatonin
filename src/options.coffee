#
# helpers
#
$ = document.querySelector.bind document
$$ = document.querySelectorAll.bind document
val = (obj) -> obj.value

#
# default
#
default_frames = 
    time:
        key_value: "00:00", option: "temperature", value: 2700
    altitude:
        key_value: 0, option: "temperature", value: 2700

#
# bind events
#
$ '#add-keyframe'
    .addEventListener 'click', (event) ->
        event.preventDefault()
        addKeyframe default_frames[val $ '#key-type']

$ '#key-type'
    .addEventListener 'input', (event) ->
        for el in $$ '.trigger-input'
            do ->
                el.value = default_frames[val $ '#key-type'].key_value 

#
# init
#
chrome.storage.local
    .get 'keyframes', (item) =>
        console.log item.keyframes
        $ '#key-type'
            .value = item.keyframes[0].key_type
        addKeyframe frame for frame in item.keyframes

#
# functions
#
addKeyframe = (frame) ->
    row = document.createElement 'tr'
    #
    # trigger
    #
    trigger = document.createElement 'th'
    trigger.classList.add 'keyframe-trigger'

    input = document.createElement 'input'
    input.classList.add 'trigger-input'

    if frame.key_type is val $ '#key-type'
        input.value = frame.key_value
    else
        input.value = default_frames[val $ '#key-type'].key_value

    row.appendChild trigger
        .appendChild input

    #
    # option
    #
    option = document.createElement 'th'
    select = document.createElement 'select'

    for opt in [ 'color', 'temperature', 'opacity' ]
        do ->
            el = document.createElement 'option'
            el.value = opt
            el.innerHTML = opt
            el.selected = true if opt is frame.option
            select.appendChild el

    row.appendChild option
        .appendChild select

    #
    # value
    # 
    value = document.createElement 'th'
    input = document.createElement 'input'
    input.type = 'number'
    input.value = frame.value

    row.appendChild value
        .appendChild input

    #
    # delete
    #
    del = document.createElement 'th'
    button = document.createElement 'button'
    button.innerHTML = "-"

    row.appendChild del
        .appendChild button

    button.addEventListener 'click', (event) ->
        event.preventDefault()
        row.parentNode.removeChild row

    $ '#keyframes'
        .appendChild row
