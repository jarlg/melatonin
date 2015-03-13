notifications =
  activate_blendmode_notification: ->
    chrome.notifications.create '',
        type: 'basic',
        title: 'Melatonin',
        message: chrome.i18n.getMessage("experimental_notification"),
        iconUrl: './thin256.png'
        (id) -> chrome.notifications.onClicked.addListener (_id) ->
          if _id is id
            chrome.tabs.create url: "chrome://flags/#enable-experimental-web-platform-features"

  request_feedback: ->
    chrome.notifications.create '',
      type: 'basic',
      title: 'Melatonin',
      message: chrome.i18n.getMessage("rate_request_notification"),
      iconUrl: './thin256.png'
      (id) -> chrome.notifications.onClicked.addListener (_id) ->
        if _id is id
          chrome.tabs.create url: "https://chrome.google.com/webstore/detail/melatonin/ijificlhclhfomkcamagbdpaodfjeokl"


module.exports = notifications
