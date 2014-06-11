(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var S, T, obj,
  __hasProp = {}.hasOwnProperty;

S = require('./sun_altitude.coffee');

T = require('./temperature_to_color.coffee');

obj = {
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
            console.log('updated %s from %s to %s', key, val.oldValue, val.newValue);
            if (key === 'last_update') {
              return chrome.storage.local.get(['longitude', 'latitude'], function(items) {
                return chrome.storage.local.set({
                  'altitude': S.get_sun_altitude(new Date(), items['longitude'], items['latitude'])
                }, function() {});
              });
            } else if (key === 'altitude') {
              return chrome.storage.local.get('temperature_map', function(item) {
                return chrome.storage.local.set({
                  'temperature': _this.alt_to_temp(val.newValue, item['temperature_map'])
                }, function() {});
              });
            } else if (key === 'temperature') {
              c = T.get_color(val.newValue);
              return chrome.storage.local.set({
                'rgb': c.r + ", " + c.g + ", " + c.b
              }, function() {});
            } else if (key === 'rgb') {
              return _this.overlay_all();
            } else if (key === 'opacity') {
              return _this.overlay();
            }
          })(key, val, namespace));
        }
        return _results;
      };
    })(this));
  },
  alt_to_temp: function(alt, map) {
    if (alt < 0) {
      return map.night;
    } else {
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
      }), function(error) {
        return console.log(error, function() {});
      });
    } else {
      return console.log('geolocation unavailable');
    }
  }
};

module.exports = obj;


},{"./sun_altitude.coffee":5,"./temperature_to_color.coffee":6}],2:[function(require,module,exports){
var helpers;

helpers = {
  between: function(min, max, ref) {
    while (ref < min) {
      ref += 360;
    }
    while (max < ref) {
      ref -= 360;
    }
    return ref;
  },
  angleToQuadrant: function(angle) {
    if (0 < angle && angle < 90) {
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


},{}],3:[function(require,module,exports){
var jd;

jd = {
  get_julian: function(date) {
    var a, jdn, m, y;
    a = date.getMonth() < 2 ? 1 : 0;
    y = date.getFullYear() + 4800 - a;
    m = (date.getMonth() + 1) + 12 * a - 3;
    jdn = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jdn + (date.getHours() - 12) / 24 + date.getMinutes() / 1440 + date.getSeconds() / 86400;
  }
};

module.exports = jd;


},{}],4:[function(require,module,exports){
var B, init, initial_config,
  __hasProp = {}.hasOwnProperty;

B = require('./background_helpers.coffee');

initial_config = {
  last_update: 0,
  opacity: 0.5,
  temperature: 2700,
  altitude: 0,
  rgb: null,
  latitude: null,
  longitude: null,
  temperature_map: {
    night: 2700,
    day: 6300
  }
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
    var val;
    console.log('in storage: ');
    for (key in items) {
      if (!__hasProp.call(items, key)) continue;
      val = items[key];
      console.log('%s : %s', key, val);
    }
    if (chrome.runtime.lastError) {
      return console.log("error when accessing storage!");
    } else if (items['last_update'] == null) {
      return chrome.storage.local.set(initial_config, init);
    } else if (Date.now() - items['last_update'] > 1000000) {
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

chrome.runtime.onMessage.addListener(function(request, sender, sendMessage) {
  if (request.type === 'display') {
    return console.log(request.value);
  } else if (request.type === 'update') {
    return B.update_position();
  }
});


},{"./background_helpers.coffee":1}],5:[function(require,module,exports){
var H, J, obj;

J = require('./julian_date.coffee');

H = require('./helpers.coffee');

obj = {
  get_sun_altitude: function(date, longitude, latitude) {
    var axial_tilt, declination, dist_to_sun, ecliptic_long, g, hour_angle, jd, jdn, l, right_ascension;
    jd = J.get_julian(date);
    jdn = jd - 2451545.0;
    l = H.between(0, 360, 280.460 + 0.9856474 * jdn);
    g = H.between(0, 360, 357.528 + 0.9856003 * jdn);
    ecliptic_long = l + 1.915 * H.angle_sin(g) + 0.02 * H.angle_sin(2 * g);
    dist_to_sun = 1.00014 - 0.01671 * H.angle_cos(g) - 0.00014 * H.angle_cos(2 * g);
    axial_tilt = 23.4;
    right_ascension = H.angle_atan(H.angle_cos(axial_tilt) * H.angle_tan(ecliptic_long));
    while (H.angleToQuadrant(ecliptic_long) !== H.angleToQuadrant(right_ascension)) {
      right_ascension += 90;
      if (right_ascension > 360) {
        right_ascension -= 360;
      }
    }
    hour_angle = H.between(0, 360, this.greenwich_sidereal_time(jd) - longitude - right_ascension);
    declination = H.angle_asin(H.angle_sin(axial_tilt) * H.angle_cos(ecliptic_long));
    return H.angle_asin(H.angle_sin(longitude) * H.angle_sin(declination) + H.angle_cos(longitude) * H.angle_cos(declination) * H.angle_cos(hour_angle));
  },
  greenwich_sidereal_time: function(jd) {
    var d, d0, eqeq, gast, gmst, l, last_jd_midnight, omega, ut_hours;
    if (jd >= Math.floor(jd + 0.5)) {
      last_jd_midnight = Math.floor(jd - 1) + 0.5;
    } else {
      last_jd_midnight = Math.floor(jd) + 0.5;
    }
    ut_hours = 24 * (jd - last_jd_midnight);
    d = jd - 2451545.0;
    d0 = last_jd_midnight - 2451545.0;
    gmst = 6.697374558 + 0.06570982441908 * d0 + 1.00273790935 * ut_hours;
    gmst = H.between(0, 24, gmst);
    omega = 125.04 - 0.052954 * d;
    l = 280.47 + 0.98565 * d;
    eqeq = H.angle_cos(23.4393 - 0.0000004 * d) * (-0.000319 * H.angle_sin(omega)) - 0.000024 * H.angle_sin(2 * l);
    gast = gmst - eqeq;
    return gast * 15;
  }
};

module.exports = obj;


},{"./helpers.coffee":2,"./julian_date.coffee":3}],6:[function(require,module,exports){
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


},{}]},{},[4])