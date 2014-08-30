(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var $, C, key, map, _,
  __hasProp = {}.hasOwnProperty;

C = require('./canvas.coffee');

$ = document.querySelector.bind(document);

map = {
  'on': {
    el: '#active-toggle',
    attr: 'checked',
    event: 'click'
  },
  'custom_opacity': {
    el: '#opacity-toggle',
    attr: 'checked',
    event: 'click'
  },
  'custom_color': {
    el: '#color-toggle',
    attr: 'checked',
    event: 'click'
  },
  'color': {
    el: '#colorpicker',
    attr: 'value',
    event: 'input'
  },
  'opacity': {
    el: '#opacity',
    attr: 'value',
    event: 'input'
  }
};

chrome.storage.local.get((function() {
  var _results;
  _results = [];
  for (key in map) {
    if (!__hasProp.call(map, key)) continue;
    _ = map[key];
    _results.push(key);
  }
  return _results;
})(), function(items) {
  var obj, _results;
  _results = [];
  for (key in map) {
    if (!__hasProp.call(map, key)) continue;
    obj = map[key];
    _results.push((function(key, obj) {
      $(map[key].el)[map[key].attr] = items[key];
      return $(map[key].el).addEventListener(map[key].event, function() {
        console.log('there was input');
        obj = {};
        obj[key] = this[map[key].attr];
        return chrome.storage.local.set(obj);
      });
    })(key, obj));
  }
  return _results;
});

chrome.storage.local.get(['latitude', 'longitude'], function(items) {
  var canvas;
  return canvas = new C.AppAltitudeGraph($('#graph'), items.latitude, items.longitude);
});


},{"./canvas.coffee":2}],2:[function(require,module,exports){
'use strict';
var AltitudeGraph, AppAltitudeGraph, OptionsAltitudeGraph, S, obj,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

S = require('./sun_altitude.coffee');

AltitudeGraph = (function() {
  function AltitudeGraph(canvas, lat, long, w, h, nPts) {
    var d, i, time;
    this.canvas = canvas;
    this.lat = lat;
    this.long = long;
    this.nPts = nPts;
    this.canvas.width = w;
    this.canvas.height = h;
    this.radius = 2;
    this.ctx = this.canvas.getContext('2d');
    d = new Date();
    d.setHours(6);
    d.setMinutes(0);
    d.setSeconds(0);
    time = d.getTime();
    this.timespan = 24;
    this.pts = (function() {
      var _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.nPts - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(S.get_sun_altitude(new Date(time + i * this.timespan * 60 * 60 * 1000 / this.nPts), this.lat, this.long));
      }
      return _results;
    }).call(this);
    this;
  }

  AltitudeGraph.prototype.yOrigo = function() {
    return Math.floor(0.5 + this.canvas.height / 2);
  };

  AltitudeGraph.prototype.render = function(n) {
    var i, _i, _ref, _results;
    this.canvas.width = this.canvas.width;
    if (n == null) {
      n = -1;
    }
    this.ctx.fillStyle = 'orange';
    _results = [];
    for (i = _i = 0, _ref = this.nPts - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      _results.push((function(_this) {
        return function() {
          _this.ctx.beginPath();
          if (i === n) {
            _this.ctx.fillStyle = 'red';
          }
          _this.ctx.arc(_this.ptX(i), _this.ptY(i), _this.radius, 0, 2 * Math.PI, false);
          _this.ctx.fill();
          if (i === n) {
            return _this.ctx.fillStyle = 'orange';
          }
        };
      })(this)());
    }
    return _results;
  };

  AltitudeGraph.prototype.ptX = function(i) {
    return this.radius + i * (this.canvas.width - 2 * this.radius) / this.nPts;
  };

  AltitudeGraph.prototype.ptY = function(i) {
    return this.yOrigo() - this.pts[i] * this.canvas.height / (2 * 90);
  };

  return AltitudeGraph;

})();

obj = {
  AppAltitudeGraph: AppAltitudeGraph = (function(_super) {
    __extends(AppAltitudeGraph, _super);

    function AppAltitudeGraph(el, lat, long) {
      var idx;
      AppAltitudeGraph.__super__.constructor.call(this, el, lat, long, 200, 129, 24);
      idx = this.getCurrentIndex();
      this.render(idx);
    }

    AppAltitudeGraph.prototype.getCurrentIndex = function() {
      return new Date().getHours() - 6;
    };

    AppAltitudeGraph.prototype.render = function(n) {
      AppAltitudeGraph.__super__.render.call(this, n);
      this.ctx.fillStyle = 'silver';
      this.ctx.font = '18pt sans-serif';
      return this.ctx.fillText(S.get_sun_altitude(new Date(), this.lat, this.long).toFixed(0) + '\u00B0', this.canvas.width - 40, 30);
    };

    return AppAltitudeGraph;

  })(AltitudeGraph),
  OptionsAltitudeGraph: OptionsAltitudeGraph = (function(_super) {
    __extends(OptionsAltitudeGraph, _super);

    function OptionsAltitudeGraph(el, lat, long) {
      OptionsAltitudeGraph.__super__.constructor.call(this, el, lat, long, 575, 340, 48);
      this.render();
    }

    return OptionsAltitudeGraph;

  })(AltitudeGraph)
};

module.exports = obj;


},{"./sun_altitude.coffee":5}],3:[function(require,module,exports){
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


},{"./helpers.coffee":3,"./julian_date.coffee":4}]},{},[1])