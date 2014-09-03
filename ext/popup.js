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


},{"./helpers.coffee":3,"./julian_date.coffee":4}],2:[function(require,module,exports){
'use strict';
var A, AltitudeGraph, AppAltitudeGraph,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

A = require('./altitude.coffee');

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
        _results.push(A.get_altitude(new Date(time + i * this.timespan * 60 * 60 * 1000 / this.nPts), this.lat, this.long));
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

AppAltitudeGraph = (function(_super) {
  __extends(AppAltitudeGraph, _super);

  function AppAltitudeGraph(lat, long, el) {
    var idx;
    AppAltitudeGraph.__super__.constructor.call(this, el, lat, long, 200, 129, 24);
    idx = this.getCurrentIndex();
    this.render(idx);
  }

  AppAltitudeGraph.prototype.getCurrentIndex = function() {
    var idx;
    idx = new Date().getHours() - 6;
    if (idx < 0) {
      idx += 24;
    }
    return idx;
  };

  AppAltitudeGraph.prototype.render = function(n) {
    AppAltitudeGraph.__super__.render.call(this, n);
    this.ctx.fillStyle = 'silver';
    this.ctx.font = '18pt sans-serif';
    return this.ctx.fillText(A.get_altitude(new Date(), this.lat, this.long).toFixed(0) + '\u00B0', this.canvas.width - 55, 30);
  };

  return AppAltitudeGraph;

})(AltitudeGraph);

module.exports = AppAltitudeGraph;


},{"./altitude.coffee":1}],3:[function(require,module,exports){
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
'use strict';
var $, Graph, sent;

Graph = require('./canvas.coffee');

$ = document.querySelector.bind(document);

sent = false;

window.onload = function() {
  chrome.runtime.sendMessage({
    type: 'init_popup'
  }, function(resp) {
    var canvas;
    canvas = new Graph(resp.lat, resp.long, $('#graph'));
    return $('#opacity').value = resp.opac;
  });
  return $('#opacity').addEventListener('input', function() {
    return chrome.runtime.sendMessage({
      type: 'set_opac',
      opac: this.value
    });
  });
};


},{"./canvas.coffee":2}]},{},[5])