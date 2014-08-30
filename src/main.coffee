'use strict'

B = require './background.coffee'

B.init()

chrome.alarms.create 'update_position', periodInMinutes: 15
chrome.alarms.onAlarm.addListener B.update_position

#chrome.tabs.onUpdated.addListener (tabid, changeInfo, tab) ->
#    B.update_overlay tab

chrome.idle.onStateChanged.addListener (newstate) ->
    console.log 'idle state change to ' + newstate
    chrome.storage.local.set 'idle_state': newstate, ->

chrome.runtime.onMessage.addListener (request, sender, sendMessage) ->
    if request.type is 'display'
        console.log request.value
    else if request.type is 'update'
        B.update_position()
    else if request.type is 'initialize'
        B.update_overlay sender.tab
