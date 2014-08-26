(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
  interpolate: function(value, key1, val1, key2, val2) {
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


},{}],2:[function(require,module,exports){
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


},{}],3:[function(require,module,exports){
'use strict';
var Keyframe, KeyframeView, Models;

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
    function KeyframeView(model, parent, controller) {
      this.model = model;
      this.parent = parent;
      this.controller = controller;
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
      this.value = document.createElement('input').set('value', this.model.value);
      this.value.classList.add('value-input');
      this.setValueType();
      this.option.addEventListener('input', this.setValueType.bind(this));
      this["delete"] = document.createElement('button').set('innerHTML', '-');
      this["delete"].classList.add('delete');
      _ref1 = ['key_value', 'option', 'value', 'delete'];
      _fn1 = (function(_this) {
        return function(input) {
          var self;
          _this.row.appendChild(document.createElement('th')).appendChild(_this[input]);
          if (input !== 'delete') {
            self = _this;
            return _this[input].addEventListener('input', function(event) {
              return self.model[input] = this.value;
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

    KeyframeView.prototype.setValueType = function() {
      this.value.type = this.option_map[this.option.value];
      return this.value.value = this.model.value;
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


},{}],4:[function(require,module,exports){
var $, $$, Canvas, M, Options, S, app, last, val;

$ = document.querySelector.bind(document);

$$ = document.querySelectorAll.bind(document);

val = function(obj) {
  return obj.value;
};

last = function(arr) {
  if (arr.length > 0) {
    return arr[arr.length - 1];
  }
};

M = require('./models.coffee');

S = require('./sun_altitude.coffee');

Options = (function() {
  function Options(parent, models, views) {
    this.parent = parent;
    this.models = models != null ? models : [];
    this.views = views != null ? views : [];
    this.prio = {
      temperature: 2,
      color: 1,
      opacity: 0
    };
    chrome.storage.local.get(['keyframes', 'latitude', 'longitude'], (function(_this) {
      return function(items) {
        var kf, _i, _len, _ref, _results;
        _this.canvas = new Canvas($('#graph'), $('#units'), items.latitude, items.longitude);
        _this.canvas.renderAltitude();
        _this.canvas.renderUnits();
        items.keyframes.sort(function(a, b) {
          if (a.option !== b.option) {
            return _this.prio[b.option] - _this.prio[a.option];
          } else {
            return a.key_value - b.key_value;
          }
        });
        _ref = items.keyframes;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          kf = _ref[_i];
          _results.push(_this.add(kf));
        }
        return _results;
      };
    })(this));
    $('#add').addEventListener('click', (function(_this) {
      return function(event) {
        event.preventDefault();
        return _this.add();
      };
    })(this));
    $('#save').addEventListener('click', (function(_this) {
      return function(event) {
        event.preventDefault();
        return chrome.storage.local.set({
          'keyframes': _this.models
        }, function() {});
      };
    })(this));
  }

  Options.prototype.add = function(model) {
    if (model == null) {
      model = new M.Keyframe();
    }
    this.models.push(model);
    this.views.push(new M.KeyframeView(model, this.parent));
    return last(this.views).create().render()["delete"].addEventListener('click', (function(_this) {
      return function(event) {
        var index;
        event.preventDefault();
        index = _this.models.indexOf(model);
        _this.models.splice(index, 1);
        return last(_this.views.splice(index, 1)).erase();
      };
    })(this));
  };

  return Options;

})();

Canvas = (function() {
  function Canvas(el, units, lat, long) {
    var d, i, time, _fn, _fn1, _i, _j, _ref, _ref1;
    this.el = el;
    this.units = units;
    this.lat = lat;
    this.long = long;
    this.el.width = 575;
    this.el.height = 340;
    this.units.width = this.el.width;
    this.units.height = this.el.height;
    this.ctx = this.el.getContext('2d');
    this.uCtx = this.units.getContext('2d');
    this.nPts = 48;
    this.timespan = 24;
    this.margin = 40;
    this.hoverThreshold = 4;
    d = new Date();
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    time = d.getTime();
    this.pts = [];
    _fn = (function(_this) {
      return function(i) {
        return _this.pts.push(S.get_sun_altitude(new Date(time + i * _this.timespan * 60 * 60 * 1000 / _this.nPts), _this.lat, _this.long));
      };
    })(this);
    for (i = _i = 0, _ref = this.nPts - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      _fn(i);
    }
    this.ptXs = [];
    this.ptYs = [];
    _fn1 = (function(_this) {
      return function(i) {
        _this.ptXs.push(_this.ptX(i));
        return _this.ptYs.push(_this.ptY(i));
      };
    })(this);
    for (i = _j = 0, _ref1 = this.nPts - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
      _fn1(i);
    }
    this.el.addEventListener('mousemove', (function(_this) {
      return function(event) {
        var _k, _ref2, _results;
        _results = [];
        for (i = _k = 0, _ref2 = _this.nPts - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
          _results.push((function() {
            if (_this.hoverThreshold > Math.abs(_this.ptXs[i] - event.layerX)) {
              return _this.renderAltitude(i);
            }
          })());
        }
        return _results;
      };
    })(this));
    this;
  }

  Canvas.prototype.renderAltitude = function(n) {
    var i, _i, _ref, _results;
    this.el.width = this.el.width;
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
          _this.ctx.arc(_this.ptXs[i], _this.ptYs[i], 2, 0, 2 * Math.PI, false);
          _this.ctx.fill();
          if (i === n) {
            return _this.ctx.fillStyle = 'orange';
          }
        };
      })(this)());
    }
    return _results;
  };

  Canvas.prototype.renderUnits = function() {
    this.units.width = this.units.width;
    this.uCtx.font = '8pt sans-serif';
    this.uCtx.fillStyle = 'black';
    this.uCtx.fillText('90', 0, this.margin);
    this.uCtx.fillText('0', 0, this.yOrigo());
    return this.uCtx.fillText('-90', 0, this.el.height - this.margin);
  };

  Canvas.prototype.yOrigo = function() {
    return Math.floor(0.5 + this.el.height / 2);
  };

  Canvas.prototype.ptX = function(i) {
    return this.margin + i * (this.el.width - 2 * this.margin) / this.nPts;
  };

  Canvas.prototype.ptY = function(i) {
    return this.yOrigo() - this.pts[i] * (this.el.height - 2 * this.margin) / (2 * 90);
  };

  return Canvas;

})();

app = new Options($('#keyframes'));


},{"./models.coffee":3,"./sun_altitude.coffee":5}],5:[function(require,module,exports){
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


},{"./helpers.coffee":1,"./julian_date.coffee":2}]},{},[4])