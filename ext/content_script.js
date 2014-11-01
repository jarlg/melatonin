(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var obj;

obj = {
  rgb_to_hex: function(rgb) {
    if ((rgb != null) && (rgb.r != null) && (rgb.g != null) && (rgb.g != null)) {
      return "#" + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
    } else {
      return null;
    }
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
    if (rgb != null) {
      return String(rgb.r) + ", " + String(rgb.g) + ", " + String(rgb.b);
    } else {
      return "255, 255, 255";
    }
  },
  temp_to_rgb: function(temperature) {
    var blue, green, red, temp;
    temp = temperature / 100;
    if (temp <= 66) {
      red = 255;
      green = temp;
      green = 99.4708025861 * Math.log(green) - 161.1195681661;
      if (temp <= 19) {
        blue = 0;
      } else {
        blue = temp - 10;
        blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
      }
    } else {
      red = temp - 60;
      red = 329.698727446 * Math.pow(red, -0.1332047592);
      green = temp - 60;
      green = 288.1221695283 * Math.pow(green, -0.0755148492);
      blue = 255;
    }
    return {
      r: red < 0 ? 0 : red > 255 ? 255 : red.toFixed(0),
      g: green < 0 ? 0 : green > 255 ? 255 : green.toFixed(0),
      b: blue < 0 ? 0 : blue > 255 ? 255 : blue.toFixed(0)
    };
  }
};

module.exports = obj;


},{}],2:[function(require,module,exports){
'use strict';
var Overlay, overlay;

Overlay = require('./overlay.coffee');

overlay = new Overlay();

chrome.runtime.sendMessage({
  type: 'init_tab'
}, function(resp) {
  return overlay.set(resp);
});

chrome.runtime.onMessage.addListener(function(req, sender, resp) {
  if (req.type === 'set') {
    return overlay.set({
      opac: req.opac,
      color: req.color
    });
  }
});


},{"./overlay.coffee":3}],3:[function(require,module,exports){
'use strict';
var C, Overlay;

C = require('./color_helpers.coffee');

Overlay = (function() {
  function Overlay() {
    this.opac = 0;
    this.color = null;
    this.el = document.createElement('div');
    this.el.style["transition"] = "background-color 0.2s";
    this.el.style.position = "fixed";
    this.el.style.top = 0;
    this.el.style.left = 0;
    this.el.style.right = 0;
    this.el.style.bottom = 0;
    this.el.style["z-index"] = 9999999999;
    this.el.style["pointer-events"] = "none";
    document.body.appendChild(this.el);
  }

  Overlay.prototype.set = function(obj) {
    if (obj.opac != null) {
      this.opac = obj.opac;
    }
    if (obj.color != null) {
      this.color = obj.color;
    }
    return this.render();
  };

  Overlay.prototype.render = function() {
    this.el.style["background-color"] = "rgb(" + C.rgb_to_string(this.color) + ")";
    return this.el.style.opacity = this.opac;
  };

  return Overlay;

})();

module.exports = Overlay;


},{"./color_helpers.coffee":1}]},{},[2])