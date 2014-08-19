(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var H, S, T, obj,
  __hasProp = {}.hasOwnProperty;

S = require('./sun_altitude.coffee');

T = require('./temperature_to_color.coffee');

H = require('./color_helpers.coffee');

obj = {
  errHandler: function(err) {
    return console.log(err.stack || err);
  },
  overlay: function(tab) {
    if (tab != null) {
      return chrome.tabs.sendMessage(tab.id, {
        type: 'update_color'
      });
    } else {
      return this.overlay_all();
    }
  },
  overlay_all: function() {
    return chrome.tabs.query({}, (function(_this) {
      return function(tabs) {
        var tab, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = tabs.length; _i < _len; _i++) {
          tab = tabs[_i];
          _results.push(_this.overlay(tab));
        }
        return _results;
      };
    })(this));
  },
  bind_storage_events: function() {
    return chrome.storage.onChanged.addListener((function(_this) {
      return function(changes, namespace) {
        var key, val, _results;
        _results = [];
        for (key in changes) {
          if (!__hasProp.call(changes, key)) continue;
          val = changes[key];
          _results.push((function(key, val, namespace) {
            var c;
            if (key === 'last_update') {
              console.log('updated %s from %s to %s (%smin)', key, val.oldValue, val.newValue, ((val.newValue - val.oldValue) / (1000 * 60)).toFixed(0));
            } else {
              console.log('updated %s from %s to %s', key, val.oldValue, val.newValue);
            }
            if (key === 'last_update') {
              return chrome.storage.local.get(['longitude', 'latitude'], function(items) {
                return chrome.storage.local.set({
                  'altitude': S.get_sun_altitude(new Date(), items.latitude, items.longitude)
                }, function() {});
              });
            } else if (key === 'altitude') {
              return chrome.storage.local.get('temperature_map', function(item) {
                return chrome.storage.local.set({
                  'temperature': _this.alt_to_temp(val.newValue, item.temperature_map)
                }, function() {});
              });
            } else if (key === 'temperature') {
              c = T.get_color(val.newValue);
              return chrome.storage.local.set({
                'rgb': H.rgb_to_string(c)
              }, function() {});
            } else if (key === 'rgb') {
              return _this.overlay_all();
            } else if (key === 'opacity') {
              return _this.overlay();
            } else if (key === 'on') {
              if (val.newValue === true) {
                _this.update_position();
              }
              return _this.overlay_all();
            } else if (key === 'custom') {
              return _this.overlay_all();
            } else if (key === 'custom_color') {
              return _this.overlay_all();
            } else if (key === 'idle_state') {
              if (val.newValue === 'active') {
                console.log('went from idle to active. updating.');
                return _this.update_position();
              }
            }
          })(key, val, namespace));
        }
        return _results;
      };
    })(this));
  },
  alt_to_temp: function(alt, map) {
    var t_alt;
    if (alt < 0) {
      return map.night;
    } else {
      t_alt = alt;
      return ((90 - alt) * map.night + alt * map.day) / 90;
    }
  },
  update_position: function() {
    if (navigator.geolocation != null) {
      return navigator.geolocation.getCurrentPosition((function(loc) {
        return chrome.storage.local.set({
          'latitude': loc.coords.latitude,
          'longitude': loc.coords.longitude,
          'last_update': Date.now()
        }, function() {});
      }), (function(err) {
        console.log("Geolocation Error:");
        this.errHandler(err);
        return chrome.storage.local.set({
          'last_update': Date.now()
        }, function() {});
      }), function() {});
    } else {
      return console.log('Geolocation unavailable');
    }
  }
};

module.exports = obj;


},{"./color_helpers.coffee":2,"./sun_altitude.coffee":6,"./temperature_to_color.coffee":7}],2:[function(require,module,exports){
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


},{}],3:[function(require,module,exports){
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
  }
};

module.exports = helpers;


},{}],4:[function(require,module,exports){
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


},{}],5:[function(require,module,exports){
var B, init, initial_config,
  __hasProp = {}.hasOwnProperty;

B = require('./background_helpers.coffee');

initial_config = {
  on: true,
  custom: false,
  idle_state: 'active',
  last_update: 0,
  opacity: 0.5,
  temperature: 2700,
  altitude: 0,
  rgb: null,
  custom_color: null,
  latitude: null,
  longitude: null,
  keyframes: [
    {
      key_type: "altitude",
      key_value: 0,
      option: "temperature",
      value: 2700
    }, {
      key_type: "altitude",
      key_value: 90,
      option: "temperature",
      value: 6300
    }
  ]
};

init = function() {
  var key, _;
  console.log('init melatonin ext');
  B.bind_storage_events();
  return chrome.storage.local.get((function() {
    var _results;
    _results = [];
    for (key in initial_config) {
      if (!__hasProp.call(initial_config, key)) continue;
      _ = initial_config[key];
      _results.push(key);
    }
    return _results;
  })(), function(items) {
    var val, _fn;
    console.log('in storage: ');
    for (key in items) {
      if (!__hasProp.call(items, key)) continue;
      val = items[key];
      console.log('%s : %s', key, val);
    }
    if (chrome.runtime.lastError) {
      console.log("error when accessing storage!");
      return;
    }
    _fn = function(key, val, items) {
      var obj;
      if (items[key] == null) {
        obj = {};
        obj[key] = val;
        return chrome.storage.local.set(obj);
      }
    };
    for (key in initial_config) {
      if (!__hasProp.call(initial_config, key)) continue;
      val = initial_config[key];
      _fn(key, val, items);
    }
    if (Date.now() - items.last_update > 15 * 60 * 1000) {
      return B.update_position();
    }
  });
};

init();

chrome.alarms.create('update_position', {
  periodInMinutes: 15
});

chrome.alarms.onAlarm.addListener(B.update_position);

chrome.tabs.onUpdated.addListener(function(tabid, changeInfo, tab) {
  return B.overlay(tab);
});

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
  }
});


},{"./background_helpers.coffee":1}],6:[function(require,module,exports){
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
  get_sun_altitude: function(date, latitude, longitude) {
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


},{"./helpers.coffee":3,"./julian_date.coffee":4}],7:[function(require,module,exports){
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


},{}]},{},[5])