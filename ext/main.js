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
  get_direction: function(date, lat, long) {
    var alt1, alt2;
    date = new Date(date.getTime());
    alt1 = this.get_altitude(date, lat, long);
    alt2 = this.get_altitude(new Date(date.getTime() + 10 * 60 * 1000), lat, long);
    if (alt2 > alt1) {
      return 1;
    } else {
      return -1;
    }
  },
  get_noon_altitude: function(date, lat, long) {
    var i, time;
    date = new Date(date.getTime());
    date.setHours(6);
    date.setMinutes(0);
    time = date.getTime();
    return H.max((function() {
      var _i, _results;
      _results = [];
      for (i = _i = 0; _i <= 36; i = ++_i) {
        _results.push(this.get_altitude(new Date(time + 20 * i * 1000 * 60), lat, long));
      }
      return _results;
    }).call(this));
  },
  get_midnight_altitude: function(date, lat, long) {
    var i, time;
    date = new Date(date.getTime());
    date.setHours(18);
    date.setMinutes(0);
    time = date.getTime();
    return H.min((function() {
      var _i, _results;
      _results = [];
      for (i = _i = 0; _i <= 36; i = ++_i) {
        _results.push(this.get_altitude(new Date(time + 20 * i * 1000 * 60), lat, long));
      }
      return _results;
    }).call(this));
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
var A, App, C, H, K, Storage;

A = require('./altitude.coffee');

H = require('./helpers.coffee');

C = require('./color_helpers.coffee');

K = require('./keyframes.coffee');

Storage = require('./storage.coffee');

App = (function() {
  function App(config) {
    this.storage = new Storage(config);
    chrome.runtime.onStartup.addListener((function(_this) {
      return function() {
        return _this.update_storage();
      };
    })(this));
    chrome.alarms.create('update_altitude', {
      periodInMinutes: 15
    });
    chrome.alarms.onAlarm.addListener((function(_this) {
      return function() {
        return _this.update_storage();
      };
    })(this));
    chrome.tabs.onUpdated.addListener((function(_this) {
      return function(_, __, tab) {
        return _this.refresh_overlay(tab, null);
      };
    })(this));
    chrome.runtime.onMessage.addListener((function(_this) {
      return function(req, sender, resp) {
        if (req.type === 'new_altitude') {
          return _this.refresh_all_overlays();
        } else if (req.type === 'init_popup') {
          _this.storage.get(['opac', 'lat', 'long'], resp);
          return true;
        } else if (req.type === 'init_tab') {
          _this.refresh_overlay(null, resp);
          return true;
        } else if (req.type === 'set_opac') {
          chrome.tabs.query({}, function(tabs) {
            var tab, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = tabs.length; _i < _len; _i++) {
              tab = tabs[_i];
              _results.push(chrome.tabs.sendMessage(tab.id, {
                type: 'set',
                opac: req.opac
              }));
            }
            return _results;
          });
          return _this.storage.set({
            'opac': req.opac
          });
        }
      };
    })(this));
  }

  App.prototype.errHandler = function(err) {
    return console.log(err.stack || err);
  };

  App.prototype.refresh_overlay = function(tab, resp) {
    return this.storage.get(['mode', 'alt', 'min', 'max', 'color', 'kfs', 'opac', 'dir'], function(it) {
      var color;
      color = K.choose_color(it);
      if (tab != null) {
        return chrome.tabs.sendMessage(tab.id, {
          type: 'set',
          color: color,
          opac: it.opac
        });
      } else if (resp != null) {
        return resp({
          color: color,
          opac: it.opac
        });
      }
    });
  };

  App.prototype.refresh_all_overlays = function() {
    return this.storage.get(['mode', 'alt', 'min', 'max', 'color', 'kfs', 'opac', 'dir'], function(it) {
      var color;
      color = K.choose_color(it);
      return chrome.tabs.query({}, function(tabs) {
        var tab, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = tabs.length; _i < _len; _i++) {
          tab = tabs[_i];
          _results.push(chrome.tabs.sendMessage(tab.id, {
            type: 'set',
            color: color,
            opac: it.opac
          }));
        }
        return _results;
      });
    });
  };

  App.prototype.update_storage = function() {
    return this._get_position((function(_this) {
      return function(lat, long) {
        var d;
        d = new Date();
        return _this.storage.set({
          lat: lat,
          long: long,
          alt: A.get_altitude(d, lat, long),
          dir: A.get_direction(d, lat, long),
          min: A.get_midnight_altitude(d, lat, long),
          max: A.get_noon_altitude(d, lat, long)
        }, function() {
          return _this.refresh_all_overlays();
        });
      };
    })(this));
  };

  App.prototype._get_position = function(cb) {
    if (navigator.geolocation != null) {
      return navigator.geolocation.getCurrentPosition(function(loc) {
        return cb(loc.coords.latitude, loc.coords.longitude);
      }, (function(_this) {
        return function(err) {
          return _this.errHandler(err);
        };
      })(this));
    } else {
      return console.log('Geolocation unavailable');
    }
  };

  return App;

})();

module.exports = App;


},{"./altitude.coffee":1,"./color_helpers.coffee":3,"./helpers.coffee":4,"./keyframes.coffee":6,"./storage.coffee":8}],3:[function(require,module,exports){
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
  $: function(id) {
    if (typeof document !== "undefined" && document !== null) {
      return document.querySelector(id);
    }
  },
  $$: function(id) {
    if (typeof document !== "undefined" && document !== null) {
      return document.querySelectorAll(id);
    }
  },
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
  interpolate: function(alt, dir, kf1, kf2, min, max) {
    var t;
    if (kf1.direction * kf2.direction >= 0) {
      if (dir * kf1.direction >= 0) {
        t = (alt - kf1.altitude) / (kf2.altitude - kf1.altitude);
      } else {
        if (dir) {
          t = (alt + kf1.altitude - 2 * min) / (2 * (max - min) - (kf2.altitude - kf1.altitude));
        } else {
          t = (2 * max - alt - kf1.altitude) / (2 * (max - min) - (kf1.altitude - kf2.altitude));
        }
      }
    } else {
      if (dir * kf1.direction >= 0) {
        if (dir) {
          t = (alt - kf1.altitude) / (2 * max - kf1.altitude - kf2.altitude);
        } else {
          t = (kf1.altitude - alt) / (kf1.altitude + kf2.altitude - 2 * min);
        }
      } else {
        if (dir) {
          t = (kf1.altitude + alt - 2 * min) / (kf1.altitude + kf2.altitude - 2 * min);
        } else {
          t = (2 * max - kf1.altitude - alt) / (2 * max - kf1.altitude - kf2.altitude);
        }
      }
    }
    return this._interpolate_colors(kf1.value, kf2.value, t);
  },
  _interpolate_colors: function(rgb1, rgb2, t) {
    var attr, rgb, _fn, _i, _len, _ref;
    rgb = {};
    _ref = ['r', 'g', 'b'];
    _fn = function() {
      return rgb[attr] = (t * rgb2[attr] + (1 - t) * rgb1[attr]).toFixed(0);
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      attr = _ref[_i];
      _fn();
    }
    return rgb;
  },
  contains: function(val, arr) {
    return arr.some(function(el) {
      return el === val;
    });
  },
  last: function(arr) {
    if (arr.length > 0) {
      return arr[arr.length - 1];
    } else {
      return null;
    }
  },
  max: function(arr) {
    var max, val, _fn, _i, _len;
    max = arr[0];
    _fn = function() {
      if (val > max) {
        return max = val;
      }
    };
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      val = arr[_i];
      _fn();
    }
    return max;
  },
  min: function(arr) {
    var val;
    return -this.max((function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = arr.length; _i < _len; _i++) {
        val = arr[_i];
        _results.push(-val);
      }
      return _results;
    })());
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
var C, H, Keyframe, KeyframeView, obj;

C = require('./color_helpers.coffee');

H = require('./helpers.coffee');

if (typeof HTMLElement !== "undefined" && HTMLElement !== null) {
  HTMLElement.prototype.set = function(attr, val) {
    this[attr] = val;
    return this;
  };
}

obj = {
  Keyframe: Keyframe = (function() {
    function Keyframe(altitude, option, value, direction) {
      this.altitude = altitude != null ? altitude : 0;
      this.option = option != null ? option : 'temperature';
      this.value = value != null ? value : 2700;
      this.direction = direction != null ? direction : 0;
    }

    return Keyframe;

  })(),
  KeyframeView: KeyframeView = (function() {
    function KeyframeView(model, parent) {
      this.model = model;
      this.parent = parent;
    }

    KeyframeView.prototype.option_map = {
      temperature: 'number',
      color: 'color'
    };

    KeyframeView.prototype.direction_map = {
      asc: 1,
      desc: -1,
      both: 0
    };

    KeyframeView.prototype.create = function() {
      var input, opt, _fn, _fn1, _fn2, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      this.row = document.createElement('tr');
      this.row.classList.add('keyframe');
      this.altitude = document.createElement('input').set('type', 'number').set('value', this.model.altitude);
      this.altitude.classList.add('key-input');
      this.option = document.createElement('select');
      this.option.classList.add('option-input');
      _ref = ['color', 'temperature'];
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
      this.direction = document.createElement('select');
      this.direction.classList.add('direction-input');
      _ref1 = ['asc', 'desc', 'both'];
      _fn1 = (function(_this) {
        return function() {
          return _this.direction.appendChild(document.createElement('option')).set('innerHTML', opt).set('selected', (_this.direction_map[opt] === _this.model.direction ? true : void 0));
        };
      })(this);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        opt = _ref1[_j];
        _fn1();
      }
      this["delete"] = document.createElement('button').set('innerHTML', '-');
      this["delete"].classList.add('delete', 'pure-button');
      _ref2 = ['altitude', 'option', 'value', 'direction', 'delete'];
      _fn2 = (function(_this) {
        return function(input) {
          var self;
          _this.row.appendChild(document.createElement('th')).appendChild(_this[input]);
          if (input !== 'delete') {
            self = _this;
            return _this[input].addEventListener('input', function(event) {
              if (this.type === 'color') {
                return self.model[input] = C.hex_to_rgb(this.value);
              } else if (input === 'direction') {
                return self.model[input] = this.direction_map[this.value];
              } else {
                return self.model[input] = this.value;
              }
            });
          }
        };
      })(this);
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        input = _ref2[_k];
        _fn2(input);
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

  })(),
  get_color: function(kfs, alt, dir, min, max) {
    var kf, last, next, _fn, _i, _len;
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
    if (kfs.length === 0) {
      return null;
    } else if (kfs.length === 1) {
      return kfs[0].value;
    }
    kfs.sort(function(a, b) {
      return a.altitude - b.altitude;
    });
    last = this._get_last_kf(kfs, alt, dir);
    next = this._get_next_kf(kfs, alt, dir);
    return H.interpolate(alt, dir, last, next, min, max);
  },
  _get_last_kf: function(kfs, alt, dir) {
    var cands;
    cands = kfs.filter(function(kf) {
      return kf.direction * dir >= 0 && (alt - kf.altitude) * dir >= 0;
    });
    if (cands.length > 0) {
      if (dir === 1) {
        return H.last(cands);
      } else {
        return cands[0];
      }
    }
    cands = kfs.filter(function(kf) {
      return kf.direction === -dir;
    });
    if (dir === 1) {
      return cands[0];
    } else {
      return H.last(cands);
    }
  },
  _get_next_kf: function(kfs, alt, dir) {
    var cands;
    cands = kfs.filter(function(kf) {
      return kf.direction * dir >= 0 && (kf.altitude - alt) * dir > 0;
    });
    if (cands.length > 0) {
      if (dir === 1) {
        return cands[0];
      } else {
        return H.last(cands);
      }
    }
    cands = kfs.filter(function(kf) {
      return kf.direction === -dir;
    });
    if (dir === 1) {
      return H.last(cands);
    } else {
      return cands[0];
    }
  },
  choose_color: function(it) {
    if (it.mode === 'manual') {
      return it.color;
    } else {
      return this.get_color(it.kfs, it.alt, it.dir, it.min, it.max);
    }
  }
};

module.exports = obj;


},{"./color_helpers.coffee":3,"./helpers.coffee":4}],7:[function(require,module,exports){
'use strict';
var App, K, app, config;

K = require('./keyframes.coffee');

App = require('./app.coffee');

config = {
  ver: '0.3.0',
  last_update: 0,
  mode: 'auto',
  alt: 0,
  lat: 0,
  long: 0,
  min: -90,
  max: 90,
  dir: 1,
  color: null,
  opac: 0.5,
  kfs: [new K.Keyframe(0, 'temperature', 2700, 0), new K.Keyframe(90, 'temperature', 6300, 0)]
};

app = new App(config);


},{"./app.coffee":2,"./keyframes.coffee":6}],8:[function(require,module,exports){
'use strict';
var A, C, H, Storage,
  __hasProp = {}.hasOwnProperty;

H = require('./helpers.coffee');

A = require('./altitude.coffee');

C = require('./color_helpers.coffee');

Storage = (function() {
  function Storage(config) {
    this.get(null, (function(_this) {
      return function(it) {
        var k, obj, v, _fn;
        if ((it.ver == null) || it.ver < '0.3.0') {
          return _this.clear(function() {
            return _this.set(config, function() {
              _this.print();
              return _this.bind_events();
            });
          });
        } else {
          obj = {};
          _fn = function() {
            if (it[k] == null) {
              return obj[k] = v;
            }
          };
          for (k in config) {
            if (!__hasProp.call(config, k)) continue;
            v = config[k];
            _fn();
          }
          return _this.set(obj, function() {
            _this.print();
            return _this.bind_events();
          });
        }
      };
    })(this));
  }

  Storage.prototype.set = function(obj, cb) {
    var k, _;
    if (H.contains('altitude', (function() {
      var _results;
      _results = [];
      for (k in obj) {
        if (!__hasProp.call(obj, k)) continue;
        _ = obj[k];
        _results.push(k);
      }
      return _results;
    })())) {
      obj.last_update = Date.now();
    }
    return chrome.storage.local.set(obj, cb);
  };

  Storage.prototype.get = function(arr, cb) {
    return chrome.storage.local.get(arr, cb);
  };

  Storage.prototype.clear = function(cb) {
    return chrome.storage.local.clear(cb);
  };

  Storage.prototype.print = function() {
    return this.get(null, function(it) {
      var k, v, _results;
      console.log('in storage:');
      _results = [];
      for (k in it) {
        if (!__hasProp.call(it, k)) continue;
        v = it[k];
        _results.push((function() {
          return console.log(k + " : " + v);
        })());
      }
      return _results;
    });
  };

  Storage.prototype.bind_events = function() {
    return chrome.storage.onChanged.addListener((function(_this) {
      return function(changes, namespace) {
        var k, v, _results;
        _results = [];
        for (k in changes) {
          if (!__hasProp.call(changes, k)) continue;
          v = changes[k];
          _results.push((function(k, v) {
            if (k === 'altitude') {
              return chrome.runtime.sendMessage({
                type: 'new_altitude'
              }, {
                value: v.newValue
              });
            }
          })(k, v));
        }
        return _results;
      };
    })(this));
  };

  return Storage;

})();

module.exports = Storage;


},{"./altitude.coffee":1,"./color_helpers.coffee":3,"./helpers.coffee":4}]},{},[7])