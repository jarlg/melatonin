(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var H, J, obj;

J = require('./julian_date.coffee');

H = require('./helpers.coffee');

obj = {
  axial_tilt: 23.439,
  get_ecliptic_long: function(l, g) {
    return l + 1.915 * H.angle_sin(g) + 0.02 * H.angle_sin(2 * g);
  },
  get_right_ascension: function(ecliptic_long) {
    return H.angle_atan(H.angle_cos(this.axial_tilt) * H.angle_tan(ecliptic_long));
  },
  get_hour_angle: function(jd, longitude, right_ascension) {
    return H.between(0, 360, this.get_gst(jd) + longitude - right_ascension);
  },
  get_declination: function(ecliptic_long) {
    return H.angle_asin(H.angle_sin(this.axial_tilt) * H.angle_sin(ecliptic_long));
  },
  get_altitude: function(date, latitude, longitude) {
    var dec, ec_long, g, ha, jd, jdn, l, r_asc;
    jd = J.get_julian_date(date);
    jdn = J.get_jdn(jd);
    l = H.between(0, 360, 280.460 + 0.9856474 * jdn);
    g = H.between(0, 360, 357.528 + 0.9856003 * jdn);
    ec_long = this.get_ecliptic_long(l, g);
    r_asc = this.get_right_ascension(ec_long);
    while (H.angleToQuadrant(ec_long) !== H.angleToQuadrant(r_asc)) {
      r_asc += r_asc < ec_long ? 90 : -90;
    }
    dec = this.get_declination(ec_long);
    ha = this.get_hour_angle(jd, longitude, r_asc);
    return H.angle_asin(H.angle_sin(latitude) * H.angle_sin(dec) + H.angle_cos(latitude) * H.angle_cos(dec) * H.angle_cos(ha));
  },
  get_last_jd_midnight: function(jd) {
    if (jd >= Math.floor(jd + 0.5)) {
      return Math.floor(jd - 1) + 0.5;
    } else {
      return Math.floor(jd) + 0.5;
    }
  },
  get_ut_hours: function(jd, last_jd_midnight) {
    return 24 * (jd - last_jd_midnight);
  },
  get_gst_hours: function(jdn_midnight, ut_hours) {
    var gmst;
    gmst = 6.697374558 + 0.06570982441908 * jdn_midnight + 1.00273790935 * ut_hours;
    return H.between(0, 24, gmst);
  },
  get_gst: function(jd) {
    var jdm;
    jdm = this.get_last_jd_midnight(jd);
    return 15 * this.get_gst_hours(J.get_jdn(jdm), this.get_ut_hours(jd, jdm));
  }
};

module.exports = obj;


},{"./helpers.coffee":4,"./julian_date.coffee":5}],2:[function(require,module,exports){
'use strict';
var C, H, M, S, obj,
  __hasProp = {}.hasOwnProperty;

H = require('./helpers.coffee');

C = require('./color_helpers.coffee');

S = require('./storage.coffee');

M = require('./keyframes.coffee');

obj = {
  config: {
    on: true,
    version: '0.3.0',
    last_update: 0,
    idle_state: 'active',
    custom_color: false,
    color: null,
    custom_opacity: true,
    opacity: 0.5,
    latitude: null,
    longitude: null,
    keyframes: [new M.Keyframe('altitude', 0, 'temperature', 2700), new M.Keyframe('altitude', 90, 'temperature', 6300)]
  },
  init: function() {
    return chrome.storage.local.get('version', (function(_this) {
      return function(it) {
        var k, _;
        console.log('initializing Melatonin(%s)...', it.version);
        if ((it.version == null) || it.version !== _this.config.version) {
          console.log('updating version; clearing storage...');
          return chrome.storage.local.clear(function() {
            console.log('cleared storage');
            return chrome.storage.local.set({
              'version': _this.config.version
            }, _this.init);
          });
        } else {
          _this.bind_storage_events();
          return chrome.storage.local.get((function() {
            var _ref, _results;
            _ref = this.config;
            _results = [];
            for (k in _ref) {
              if (!__hasProp.call(_ref, k)) continue;
              _ = _ref[k];
              _results.push(k);
            }
            return _results;
          }).call(_this), function(it) {
            var v, _fn, _ref;
            console.log('in storage: ');
            for (k in it) {
              if (!__hasProp.call(it, k)) continue;
              v = it[k];
              console.log('%s : %s', k, v);
            }
            if (chrome.runtime.lastError) {
              console.log("error when accessing storage!");
              return;
            }
            _ref = _this.config;
            _fn = function(k, v) {
              if (it[k] == null) {
                obj = {};
                obj[k] = v;
                return chrome.storage.local.set(obj);
              }
            };
            for (k in _ref) {
              if (!__hasProp.call(_ref, k)) continue;
              v = _ref[k];
              _fn(k, v);
            }
            if (Date.now() - it.last_update > 15 * 60 * 1000) {
              return _this.update_position();
            }
          });
        }
      };
    })(this));
  },
  errHandler: function(err) {
    return console.log(err.stack || err);
  },
  overlay: function(tab, opac, color) {
    return chrome.tabs.sendMessage(tab.id, {
      type: 'set_color',
      opacity: opac,
      color: color
    });
  },
  update_overlay: function(tab) {
    return S.with_color((function(_this) {
      return function(opac, rgb) {
        return _this.overlay(tab, opac, C.rgb_to_string(rgb));
      };
    })(this));
  },
  update_overlays: function() {
    return S.with_color((function(_this) {
      return function(opac, rgb) {
        return chrome.tabs.query({}, function(tabs) {
          var tab, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = tabs.length; _i < _len; _i++) {
            tab = tabs[_i];
            _results.push(_this.overlay(tab, opac, C.rgb_to_string(rgb)));
          }
          return _results;
        });
      };
    })(this));
  },
  bind_storage_events: function() {
    return chrome.storage.onChanged.addListener((function(_this) {
      return function(changes, namespace) {
        var k, v, _results;
        _results = [];
        for (k in changes) {
          if (!__hasProp.call(changes, k)) continue;
          v = changes[k];
          _results.push((function(k, v) {
            if (k === 'last_update') {
              console.log('updated %s from %s to %s (%smin)', k, v.oldValue, v.newValue, ((v.newValue - v.oldValue) / (1000 * 60)).toFixed(0));
            } else {
              console.log('updated %s from %s to %s', k, v.oldValue, v.newValue);
            }
            if ((k === 'on' && v.newValue) || k === 'idle_state') {
              _this.update_position();
            }
            if (H.contains(k, ['on', 'custom_color', 'color', 'custom_opacity', 'opacity', 'longitude', 'latitude', 'keyframes'])) {
              return _this.update_overlays();
            }
          })(k, v));
        }
        return _results;
      };
    })(this));
  },
  update_position: function() {
    if (navigator.geolocation != null) {
      return navigator.geolocation.getCurrentPosition(function(loc) {
        return chrome.storage.local.set({
          'latitude': loc.coords.latitude,
          'longitude': loc.coords.longitude,
          'last_update': Date.now()
        });
      }, (function(_this) {
        return function(err) {
          console.log("Geolocation Error:");
          _this.errHandler(err);
          return chrome.storage.local.set({
            'last_update': Date.now()
          });
        };
      })(this), function() {});
    } else {
      return console.log('Geolocation unavailable');
    }
  }
};

module.exports = obj;


},{"./color_helpers.coffee":3,"./helpers.coffee":4,"./keyframes.coffee":6,"./storage.coffee":8}],3:[function(require,module,exports){
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


},{}],4:[function(require,module,exports){
'use strict';
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
    var attr, idx, idx1, idx2, rgb, _fn, _i, _len, _ref;
    kfs = kfs.filter(function(el) {
      return el.option === type;
    });
    if (kfs.length === 0) {
      return 0;
    }
    kfs.sort(function(a, b) {
      return a.key_value - b.key_value;
    });
    idx = kfs.filter(function(el) {
      return el.key_value < altitude;
    }).length;
    idx1 = idx !== 0 ? idx - 1 : kfs.length - 1;
    idx2 = idx !== kfs.length ? idx : 0;
    if (type === 'color') {
      rgb = {};
      _ref = ['r', 'g', 'b'];
      _fn = (function(_this) {
        return function(attr) {
          return rgb[attr] = _this.linear_interpolate(altitude, kfs[idx1].key_value, parseInt(kfs[idx1].value[attr]), kfs[idx2].key_value, parseInt(kfs[idx2].value[attr])).toFixed(0);
        };
      })(this);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        attr = _ref[_i];
        _fn(attr);
      }
      return rgb;
    } else {
      return this.linear_interpolate(altitude, kfs[idx1].key_value, kfs[idx1].value, kfs[idx2].key_value, kfs[idx2].value);
    }
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


},{}],5:[function(require,module,exports){
var jd;

jd = {
  get_julian_day: function(date) {
    var a, m, y;
    a = date.getUTCMonth() < 2 ? 1 : 0;
    y = date.getUTCFullYear() + 4800 - a;
    m = (date.getUTCMonth() + 1) + 12 * a - 3;
    return date.getUTCDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  },
  get_julian_date: function(date) {
    return this.get_julian_day(date) + (date.getUTCHours() - 12) / 24 + date.getUTCMinutes() / 1440 + date.getUTCSeconds() / 86400;
  },
  get_jdn: function(jd) {
    return jd - 2451545.0;
  }
};

module.exports = jd;


},{}],6:[function(require,module,exports){
'use strict';
var C, Keyframe, KeyframeView, Models;

C = require('./color_helpers.coffee');

if (typeof HTMLElement !== "undefined" && HTMLElement !== null) {
  HTMLElement.prototype.set = function(attr, val) {
    this[attr] = val;
    return this;
  };
}

Models = {
  Keyframe: Keyframe = (function() {
    function Keyframe(key_type, key_value, option, value) {
      this.key_type = key_type != null ? key_type : 'altitude';
      this.key_value = key_value != null ? key_value : 0;
      this.option = option != null ? option : 'temperature';
      this.value = value != null ? value : 2700;
    }

    return Keyframe;

  })(),
  KeyframeView: KeyframeView = (function() {
    function KeyframeView(model, parent) {
      this.model = model;
      this.parent = parent;
    }

    KeyframeView.prototype.option_map = {
      opacity: 'number',
      temperature: 'number',
      color: 'color'
    };

    KeyframeView.prototype.create = function() {
      var input, opt, _fn, _fn1, _i, _j, _len, _len1, _ref, _ref1;
      this.row = document.createElement('tr');
      this.row.classList.add('keyframe');
      this.key_value = document.createElement('input').set('type', 'number').set('value', this.model.key_value);
      this.key_value.classList.add('key-input');
      this.option = document.createElement('select');
      _ref = ['color', 'temperature', 'opacity'];
      _fn = (function(_this) {
        return function() {
          return _this.option.appendChild(document.createElement('option')).set('innerHTML', opt).set('selected', (opt === _this.model.option ? true : void 0));
        };
      })(this);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        opt = _ref[_i];
        _fn();
      }
      this.value = document.createElement('input');
      this.value.classList.add('value-input');
      this.set_value_type();
      this.set_value_value();
      this.option.addEventListener('input', (function(_this) {
        return function() {
          _this.set_value_type();
          return _this.set_value_value();
        };
      })(this));
      this["delete"] = document.createElement('button').set('innerHTML', '-');
      this["delete"].classList.add('delete', 'pure-button');
      _ref1 = ['key_value', 'option', 'value', 'delete'];
      _fn1 = (function(_this) {
        return function(input) {
          var self;
          _this.row.appendChild(document.createElement('th')).appendChild(_this[input]);
          if (input !== 'delete') {
            self = _this;
            return _this[input].addEventListener('input', function(event) {
              if (this.type === 'color') {
                return self.model[input] = C.hex_to_rgb(this.value);
              } else {
                return self.model[input] = this.value;
              }
            });
          }
        };
      })(this);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        input = _ref1[_j];
        _fn1(input);
      }
      return this;
    };

    KeyframeView.prototype.set_value_type = function() {
      this.value.type = this.option_map[this.option.value];
      if (this.value.type === 'color') {
        return this.value.classList.add('color-input');
      } else {
        return this.value.classList.remove('color-input');
      }
    };

    KeyframeView.prototype.set_value_value = function() {
      return this.value.value = this.value.type === 'color' ? C.rgb_to_hex(this.model.value) : this.model.value;
    };

    KeyframeView.prototype.render = function() {
      this.parent.appendChild(this.row);
      return this;
    };

    KeyframeView.prototype.erase = function() {
      this.parent.removeChild(this.row);
      return this;
    };

    return KeyframeView;

  })()
};

module.exports = Models;


},{"./color_helpers.coffee":3}],7:[function(require,module,exports){
'use strict';
var B;

B = require('./background.coffee');

B.init();

chrome.alarms.create('update_position', {
  periodInMinutes: 15
});

chrome.alarms.onAlarm.addListener(B.update_position);

chrome.idle.onStateChanged.addListener(function(newstate) {
  console.log('idle state change to ' + newstate);
  return chrome.storage.local.set({
    'idle_state': newstate
  }, function() {});
});

chrome.runtime.onMessage.addListener(function(request, sender, sendMessage) {
  if (request.type === 'display') {
    return console.log(request.value);
  } else if (request.type === 'update') {
    return B.update_position();
  } else if (request.type === 'initialize') {
    return B.update_overlay(sender.tab);
  }
});


},{"./background.coffee":2}],8:[function(require,module,exports){
'use strict';
var A, C, H, obj;

H = require('./helpers.coffee');

A = require('./altitude.coffee');

C = require('./color_helpers.coffee');

obj = {
  with_color: function(cb) {
    console.log('getting from storage...');
    return chrome.storage.local.get(['on', 'custom_color', 'color', 'custom_opacity', 'opacity', 'latitude', 'longitude', 'keyframes'], (function(_this) {
      return function(it) {
        var color, opacity;
        if (!it.on) {
          return cb(0, null);
        }
        if (it.custom_color) {
          color = it.color;
        } else {
          color = _this._get_kf_color(it.keyframes, it.latitude, it.longitude);
        }
        if (it.custom_opacity) {
          opacity = it.opacity;
        } else {
          opacity = _this._get_kf_opacity(it.keyframes, it.latitude, it.longitude);
        }
        return cb(opacity, color);
      };
    })(this));
  },
  _get_kf_color: function(kfs, lat, long) {
    var kf, _fn, _i, _len;
    _fn = function(kf) {
      if (kf.option === 'temperature') {
        kf.option = 'color';
        return kf.value = C.temp_to_rgb(kf.value);
      }
    };
    for (_i = 0, _len = kfs.length; _i < _len; _i++) {
      kf = kfs[_i];
      _fn(kf);
    }
    return H.get(kfs, 'color', A.get_altitude(new Date(), lat, long));
  },
  _get_kf_opacity: function(kfs, lat, long) {
    return H.get(kfs, 'opacity', A.get_altitude(new Date(), lat, long));
  }
};

module.exports = obj;


},{"./altitude.coffee":1,"./color_helpers.coffee":3,"./helpers.coffee":4}]},{},[7])