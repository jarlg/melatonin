class MixBlendModeNotification
  constructor: ->
    chrome.notifications.create '',
      type: 'basic',
      title: 'Melatonin',
      message: 'Hey! If you activate Chrome\'s experimental web features you\'ll get better contrast for reading or viewing images with Melatonin!',
      iconUrl: './thin256.png'
      (id) -> chrome.notifications.onClicked.addListener (_id) ->
        if _id is id
          chrome.tabs.create url: "chrome://flags/#enable-experimental-web-platform-features"

module.exports = MixBlendModeNotification
