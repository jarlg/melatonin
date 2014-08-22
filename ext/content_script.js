(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var obj;

obj = {
  rgb_to_hex: function(rgb) {
    return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
  },
  hex_to_rgb: function(hex) {
    var result, shorthandRegex;
    shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
    result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      };
    } else {
      return null;
    }
  },
  rgb_to_string: function(rgb) {
    return rgb.r + ", " + rgb.g + ", " + rgb.b;
  }
};

module.exports = obj;


},{}],2:[function(require,module,exports){
var C, init_overlay, set_bgcolor, update_color;

C = require('./color_helpers.coffee');

init_overlay = function() {
  var overlay;
  overlay = document.createElement('div');
  overlay.style["transition"] = "background-color 0.2s";
  update_color(overlay);
  overlay.id = 'melatonin-overlay';
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style["z-index"] = 9999999999;
  overlay.style["pointer-events"] = "none";
  return document.body.appendChild(overlay);
};

set_bgcolor = function(element, color, opacity) {
  if (color != null) {
    return element.style['background-color'] = "rgba(" + color + ", " + opacity + ")";
  } else {
    return element.style['background-color'] = "transparent";
  }
};

update_color = function(element) {
  console.log("updating color!");
  if (element == null) {
    element = document.getElementById('melatonin-overlay');
  }
  return chrome.storage.local.get(['on', 'rgb', 'opacity', 'custom', 'custom_color'], function(items) {
    if (items.on) {
      if (!items.custom) {
        return set_bgcolor(element, items.rgb, items.opacity);
      } else {
        return set_bgcolor(element, C.rgb_to_string(C.hex_to_rgb(items.custom_color)), items.opacity);
      }
    } else {
      return set_bgcolor(element);
    }
  });
};

init_overlay();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'update_color') {
    return update_color();
  }
});


},{"./color_helpers.coffee":1}]},{},[2])