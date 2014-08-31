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
var A, AltitudeGraph, AppAltitudeGraph, OptionsAltitudeGraph, obj,
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


},{"./altitude.coffee":1}],3:[function(require,module,exports){
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
var $, $$, G, M, Options, app, last, val;

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

M = require('./keyframes.coffee');

G = require('./canvas.coffee');

Options = (function() {
  function Options(parent, models, views) {
    var self;
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
        _this.canvas = new G.OptionsAltitudeGraph($('#graph'), items.latitude, items.longitude);
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
    self = this;
    $('#save').addEventListener('click', function(event) {
      event.preventDefault();
      return chrome.storage.local.set({
        'keyframes': self.models
      }, (function(_this) {
        return function() {
          _this.classList.remove('pure-button-primary');
          _this.classList.add('button-success');
          _this.innerHTML = 'saved!';
          return window.setTimeout((function() {
            _this.classList.add('pure-button-primary');
            _this.classList.remove('button-success');
            return _this.innerHTML = 'save';
          }), 1000);
        };
      })(this));
    });
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

app = new Options($('#keyframes'));


},{"./canvas.coffee":2,"./keyframes.coffee":6}]},{},[7])