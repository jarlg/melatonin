(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var H, obj;

H = require('./helpers.coffee');

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
  },
  get_atm_opac: function(cb) {
    return chrome.storage.local.get(['keyframes', 'altitude'], function(items) {
      return cb(H.get(items.keyframes, 'opacity', items.altitude));
    });
  }
};

module.exports = obj;


},{"./helpers.coffee":3}],2:[function(require,module,exports){
var C, T, handle_customs, init_overlay, set_bgcolor, update_color;

C = require('./color_helpers.coffee');

T = require('./temperature_to_color.coffee');

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

set_bgcolor = function(el, color, opacity) {
  if (color != null) {
    return el.style['background-color'] = "rgba(" + color + ", " + opacity + ")";
  } else {
    return el.style['background-color'] = "transparent";
  }
};

handle_customs = function(el, items, opac) {
  if (!items.custom_color) {
    return set_bgcolor(el, C.rgb_to_string(T.get_color(items.temperature)), opac);
  } else {
    return set_bgcolor(el, C.rgb_to_string(C.hex_to_rgb(items.color)), opac);
  }
};

update_color = function(el) {
  console.log("updating color!");
  if (el == null) {
    el = document.getElementById('melatonin-overlay');
  }
  return chrome.storage.local.get(['on', 'temperature', 'opacity', 'custom_opacity', 'color', 'custom_color'], function(items) {
    if (items.on) {
      if (items.custom_opacity) {
        return handle_customs(el, items, items.opacity);
      } else {
        return C.get_atm_opac(function(opac) {
          return handle_customs(el, items, opac);
        });
      }
    } else {
      return set_bgcolor(el);
    }
  });
};

init_overlay();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'update_color') {
    return update_color();
  }
});


},{"./color_helpers.coffee":1,"./temperature_to_color.coffee":4}],3:[function(require,module,exports){
var helpers;

helpers = {
  between: function(min, max, val) {
    while (val < min) {
      val += max - min;
    }
    while (max <= val) {
      val -= max - min;
    }
    return val;
  },
  angleToQuadrant: function(angle) {
    angle = this.between(0, 360, angle);
    if (angle < 90) {
      return 1;
    } else if (angle < 180) {
      return 2;
    } else if (angle < 270) {
      return 3;
    } else if (angle < 360) {
      return 4;
    }
  },
  to_radians: function(angle) {
    return angle * Math.PI / 180;
  },
  to_angle: function(rad) {
    return rad * 180 / Math.PI;
  },
  angle_sin: function(x) {
    return Math.sin(this.to_radians(x));
  },
  angle_cos: function(x) {
    return Math.cos(this.to_radians(x));
  },
  angle_tan: function(x) {
    return Math.tan(this.to_radians(x));
  },
  angle_atan: function(x) {
    return this.to_angle(Math.atan(x));
  },
  angle_asin: function(x) {
    return this.to_angle(Math.asin(x));
  },
  get: function(kfs, type, altitude) {
    var idx;
    console.log('starting %s interpolation', type);
    kfs = kfs.filter(function(el) {
      return el.option === type;
    });
    console.log(kfs);
    if (kfs.length === 0) {
      return 0;
    }
    kfs.sort(function(a, b) {
      return a.key_value - b.key_value;
    });
    console.log('sorting ...');
    console.log(kfs);
    idx = kfs.filter(function(el) {
      return el.key_value < item.altitude;
    }).length;
    console.log('got index %s', idx);
    return this.linear_interpolate(altitude, kfs[idx !== 0 ? idx - 1 : kfs.length - 1].key_value, kfs[idx !== 0 ? idx - 1 : kfs.length - 1].value, kfs[idx !== kfs.length ? idx : 0].key_value, kfs[idx !== kfs.length ? idx : 0].value);
  },
  linear_interpolate: function(value, key1, val1, key2, val2) {
    if (key2 === key1) {
      return val1;
    } else {
      return val1 + (val2 - val1) * (value - key1) / (key2 - key1);
    }
  },
  contains: function(val, arr) {
    return arr.some(function(el) {
      return el === val;
    });
  }
};

module.exports = helpers;


},{}],4:[function(require,module,exports){
var obj;

obj = {
  get_color: function(temperature) {
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


},{}]},{},[2])