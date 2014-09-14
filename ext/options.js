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
  interpolate: function(keymode, alt, dir, kf1, kf2, min, max) {
    var delta_minutes, minutes_since_last, now, t;
    if (keymode === 'altitude') {
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
    } else {
      now = new Date();
      delta_minutes = kf2.time[0] * 60 + kf2.time[1] - kf1.time[0] * 60 + kf1.time[1];
      if (delta_minutes < 0) {
        delta_minutes += 24 * 60;
      }
      minutes_since_last = now.getHours() * 60 + now.getMinutes() - kf1.time[0] * 60 - kf1.time[1];
      if (minutes_since_last < 0) {
        minutes_since_last += 24 * 60;
      }
      t = minutes_since_last / delta_minutes;
    }
    if (kf1.option === 'color') {
      return this._interpolate_colors(kf1.value, kf2.value, t);
    } else if (kf1.option === 'opacity') {
      return (t * kf2.value + (1 - t) * kf1.value).toFixed(0);
    }
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


},{}],3:[function(require,module,exports){
'use strict';
var AKeyframe, C, H, KeyframeView, TKeyframe, obj;

C = require('./color_helpers.coffee');

H = require('./helpers.coffee');

if (typeof HTMLElement !== "undefined" && HTMLElement !== null) {
  HTMLElement.prototype.set = function(attr, val) {
    this[attr] = val;
    return this;
  };
}

obj = {
  AKeyframe: AKeyframe = (function() {
    function AKeyframe(altitude, option, value, direction) {
      this.altitude = altitude != null ? altitude : 0;
      this.option = option != null ? option : 'temperature';
      this.value = value != null ? value : 2700;
      this.direction = direction != null ? direction : 0;
    }

    return AKeyframe;

  })(),
  TKeyframe: TKeyframe = (function() {
    function TKeyframe(time, option, value) {
      this.time = time != null ? time : [0, 0];
      this.option = option != null ? option : 'temperature';
      this.value = value != null ? value : 2700;
    }

    return TKeyframe;

  })(),
  KeyframeView: KeyframeView = (function() {
    function KeyframeView(model, row, keymode) {
      var opt, _fn, _i, _len, _ref;
      this.model = model;
      this.row = row;
      this.keymode = keymode;
      if (this.model.option === 'color') {
        this.color = C.rgb_to_hex(this.model.value);
      } else {
        this.color = null;
        _ref = ['temperature', 'opacity'];
        _fn = (function(_this) {
          return function(opt) {
            if (opt === _this.model.option) {
              return _this[opt] = _this.model.value;
            } else {
              return _this[opt] = null;
            }
          };
        })(this);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          opt = _ref[_i];
          _fn(opt);
        }
      }
      this;
    }

    KeyframeView.prototype.option_map = {
      opacity: 'number',
      temperature: 'number',
      color: 'color'
    };

    KeyframeView.prototype.direction_map = {
      asc: 1,
      desc: -1,
      both: 0
    };

    KeyframeView.prototype.option_defaults = {
      opacity: 50,
      temperature: 2700,
      color: '#ffffff'
    };

    KeyframeView.prototype.create = function() {
      var hours, minutes, opt, self, _fn, _fn1, _i, _j, _len, _len1, _ref, _ref1;
      console.log('attempting to create %s kf', this.keymode);
      self = this;
      if (this.keymode === 'altitude') {
        this.altitude = document.createElement('input').set('type', 'number').set('value', this.model.altitude);
        this.altitude.classList.add('key-input');
        this.altitude.addEventListener('input', function(event) {
          if (this.value > 99) {
            this.value = 99;
          } else if (this.value < -99) {
            this.value = -99;
          }
          return self.model.altitude = this.value;
        });
      } else if (this.keymode === 'time') {
        hours = this.model.time[0] > 9 ? this.model.time[0] : '0' + this.model.time[0];
        minutes = this.model.time[1] > 9 ? this.model.time[1] : '0' + this.model.time[1];
        this.time = document.createElement('input').set('type', 'time').set('value', hours + ":" + minutes);
        this.time.addEventListener('input', function(event) {
          var v;
          self.model.time = (function() {
            var _i, _len, _ref, _results;
            _ref = this.value.split(':');
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              v = _ref[_i];
              _results.push(parseInt(v, 10));
            }
            return _results;
          }).call(this);
          return console.log(self.model.time);
        });
      }
      console.log('done with key');
      this.option = document.createElement('select');
      this.option.classList.add('option-input');
      _ref = ['color', 'temperature', 'opacity'];
      _fn = (function(_this) {
        return function(opt) {
          return _this.option.appendChild(document.createElement('option')).set('innerHTML', opt).set('selected', (opt === _this.model.option ? true : void 0));
        };
      })(this);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        opt = _ref[_i];
        _fn(opt);
      }
      this.value = document.createElement('input');
      this.value.classList.add('value-input');
      this.set_value_type();
      this.set_value_value();
      this.option.addEventListener('input', function() {
        self.model.option = this.value;
        self.set_value_type();
        return self.set_value_value();
      });
      this.value.addEventListener('input', function(event) {
        if (self.option.value === 'color') {
          self.model.value = C.hex_to_rgb(this.value);
        } else {
          self.model.value = this.value;
        }
        return self[self.option.value] = this.value;
      });
      console.log('done with options');
      if (this.keymode === 'altitude') {
        this.direction = document.createElement('select');
        this.direction.classList.add('direction-input');
        _ref1 = ['asc', 'desc', 'both'];
        _fn1 = (function(_this) {
          return function(opt) {
            return _this.direction.appendChild(document.createElement('option')).set('innerHTML', opt).set('selected', (_this.direction_map[opt] === _this.model.direction ? true : void 0));
          };
        })(this);
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          opt = _ref1[_j];
          _fn1(opt);
        }
        this.direction.addEventListener('input', function(event) {
          return self.model.direction = self.direction_map[this.value];
        });
      }
      this["delete"] = document.createElement('button').set('innerHTML', '-');
      this["delete"].classList.add('delete', 'button');
      return this;
    };

    KeyframeView.prototype.set_value_type = function() {
      var opt, _i, _len, _ref, _results;
      this.value.type = this.option_map[this.option.value];
      _ref = ['color', 'opacity', 'temperature'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        opt = _ref[_i];
        _results.push((function(_this) {
          return function() {
            return _this.value.classList.toggle(opt + '-input', _this.option.value === opt);
          };
        })(this)());
      }
      return _results;
    };

    KeyframeView.prototype.set_value_value = function() {
      var opt, _i, _len, _ref, _results;
      if (this.option.value === 'color') {
        if (this.color != null) {
          return this.value.value = this.color;
        } else {
          return this.value.value = this.option_defaults['color'];
        }
      } else {
        _ref = ['temperature', 'opacity'];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          opt = _ref[_i];
          _results.push((function(_this) {
            return function(opt) {
              if (_this.option.value === opt) {
                if (_this[opt] != null) {
                  return _this.value.value = _this[opt];
                } else {
                  return _this.value.value = _this.option_defaults[opt];
                }
              }
            };
          })(this)(opt));
        }
        return _results;
      }
    };

    KeyframeView.prototype.render = function() {
      var input, inputs, _fn, _i, _len;
      if (this.keymode === 'altitude') {
        inputs = ['altitude', 'option', 'value', 'direction', 'delete'];
      } else {
        this.row.appendChild(document.createElement('td')).appendChild(this.time);
        inputs = ['option', 'value', 'delete'];
      }
      _fn = (function(_this) {
        return function(input) {
          if (_this[input] != null) {
            return _this.row.appendChild(document.createElement('td')).appendChild(_this[input]);
          }
        };
      })(this);
      for (_i = 0, _len = inputs.length; _i < _len; _i++) {
        input = inputs[_i];
        _fn(input);
      }
      return this;
    };

    KeyframeView.prototype.erase = function() {
      this.row.parentNode.removeChild(this.row);
      return this;
    };

    return KeyframeView;

  })(),
  get_opac: function(it) {
    var kf, last, next, _fn, _i, _len, _ref;
    it.kfs = it.kfs.filter(function(kf) {
      return (kf[it.keymode] != null) && kf.option === 'opacity';
    });
    if (it.kfs.length === 0) {
      return 0;
    } else if (it.kfs.length === 1) {
      return it.kfs[0].value / 100;
    }
    if (it.keymode === 'altitude') {
      _ref = it.kfs;
      _fn = function() {
        if (kf.altitude > 90) {
          return kf.altitude = it.max;
        } else if (kf.altitude < -90) {
          return kf.altitude = it.min;
        }
      };
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        kf = _ref[_i];
        _fn();
      }
      it.kfs.sort(function(a, b) {
        return a.altitude - b.altitude;
      });
    } else {
      it.kfs.sort(function(a, b) {
        return a.time[0] * 60 + a.time[1] - b.time[0] * 60 + b.time[1];
      });
    }
    last = this._get_last_kf(it.kfs, it.keymode, it.alt, it.dir);
    next = this._get_next_kf(it.kfs, it.keymode, it.alt, it.dir);
    if (next === last) {
      return last.value / 100;
    }
    return 0.01 * H.interpolate(it.keymode, it.alt, it.dir, last, next, it.min, it.max);
  },
  get_color: function(kfs, keymode, alt, dir, min, max) {
    var kf, last, next, _fn, _fn1, _i, _j, _len, _len1;
    kfs = kfs.filter(function(kf) {
      return (kf[keymode] != null) && H.contains(kf.option, ['temperature', 'color']);
    });
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
    if (keymode === 'altitude') {
      _fn1 = function() {
        if (kf.altitude > 90) {
          return kf.altitude = max;
        } else if (kf.altitude < -90) {
          return kf.altitude = min;
        }
      };
      for (_j = 0, _len1 = kfs.length; _j < _len1; _j++) {
        kf = kfs[_j];
        _fn1();
      }
      kfs.sort(function(a, b) {
        return a.altitude - b.altitude;
      });
    } else {
      kfs.sort(function(a, b) {
        return a.time[0] * 60 + a.time[1] - b.time[0] * 60 + b.time[1];
      });
    }
    last = this._get_last_kf(kfs, keymode, alt, dir);
    next = this._get_next_kf(kfs, keymode, alt, dir);
    if (next === last) {
      return last.value;
    }
    return H.interpolate(keymode, alt, dir, last, next, min, max);
  },
  _get_last_kf: function(kfs, keymode, alt, dir) {
    var cands, date;
    if (keymode === 'altitude') {
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
        return kf.direction * dir <= 0;
      });
      if (dir === 1) {
        return cands[0];
      } else {
        return H.last(cands);
      }
    } else {
      date = new Date();
      cands = kfs.filter(function(kf) {
        return kf.time[0] < date.getHours() || (kf.time[0] === date.getHours() && kf.time[1] < date.getMinutes());
      });
      if (cands.length > 0) {
        return H.last(cands);
      }
      return last(kfs);
    }
  },
  _get_next_kf: function(kfs, keymode, alt, dir) {
    var cands, date;
    if (keymode === 'altitude') {
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
        return kf.direction * dir <= 0;
      });
      if (dir === 1) {
        return H.last(cands);
      } else {
        return cands[0];
      }
    } else {
      date = new Date();
      cands = kfs.filter(function(kf) {
        return kf.time[0] > date.getHours() || (kf.time[0] === date.getHours && date.getMinutes() > kf.time[1]);
      });
      if (cands.length > 0) {
        return cands[0];
      }
      return kfs[0];
    }
  },
  choose_color: function(it) {
    if (it.mode === 'manual') {
      return it.color;
    } else {
      return this.get_color(it.kfs, it.keymode, it.alt, it.dir, it.min, it.max);
    }
  }
};

module.exports = obj;


},{"./color_helpers.coffee":1,"./helpers.coffee":2}],4:[function(require,module,exports){
'use strict';
var Options;

Options = require('./options_model.coffee');

window.onload = function() {
  var options;
  return options = new Options();
};


},{"./options_model.coffee":5}],5:[function(require,module,exports){
'use strict';
var $, $$, C, K, KFTable, Options, last, val;

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

K = require('./keyframes.coffee');

C = require('./color_helpers.coffee');

KFTable = (function() {
  function KFTable(table, keymode) {
    this.table = table;
    this.keymode = keymode;
    console.log('created KFTable');
    this;
  }

  KFTable.prototype.kfs = [];

  KFTable.prototype.views = [];

  KFTable.prototype.add = function(kf) {
    if (kf == null) {
      if (this.keymode === 'altitude') {
        kf = new K.AKeyframe();
      } else {
        kf = new K.TKeyframe();
      }
    }
    console.log('added alt kf: %s', kf.altitude != null);
    this.kfs.push(kf);
    if (kf[this.keymode] != null) {
      return this.createView(kf);
    }
  };

  KFTable.prototype.createView = function(kf) {
    var row, view;
    row = document.createElement('tr');
    row.classList.add('keyframe');
    view = new K.KeyframeView(kf, row, this.keymode);
    this.views.push(view);
    return view.create()["delete"].addEventListener('click', (function(_this) {
      return function(event) {
        var v_idx;
        event.preventDefault();
        v_idx = _this.views.indexOf(view);
        _this.kfs.splice(_this.kfs.indexOf(_this.views[v_idx].model), 1);
        _this.views[v_idx].erase();
        return _this.views.splice(v_idx, 1);
      };
    })(this));
  };

  KFTable.prototype.clear_header = function() {
    if (this.head_tr.parentNode != null) {
      this.head_tr.parentNode.removeChild(this.head_tr);
    }
    return this;
  };

  KFTable.prototype.clear_views = function() {
    var view, _i, _len, _ref;
    if (this.views.length > 0) {
      _ref = this.views;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        view = _ref[_i];
        view.erase();
      }
      this.views.length = 0;
    }
    return this;
  };

  KFTable.prototype.create_header = function() {
    var title, _fn, _i, _len, _ref;
    this.head_tr = document.createElement('tr');
    this.head_tr.appendChild(document.createElement('th')).appendChild(this.keymode_input);
    _ref = ['option', 'value', 'direction'];
    _fn = (function(_this) {
      return function() {
        if (title !== 'direction' || _this.keymode !== 'time') {
          return _this.head_tr.appendChild(document.createElement('th')).set('innerHTML', title);
        }
      };
    })(this);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      title = _ref[_i];
      _fn();
    }
    this.head_tr.appendChild(document.createElement('th')).appendChild(this.add_button);
    return this;
  };

  KFTable.prototype.create = function() {
    var opt, self, _fn, _i, _len, _ref;
    console.log('creating KFTable');
    this.keymode_input = document.createElement('select');
    _ref = ['altitude', 'time'];
    _fn = (function(_this) {
      return function() {
        return _this.keymode_input.appendChild(document.createElement('option')).set('innerHTML', opt).set('selected', (opt === _this.keymode ? true : void 0));
      };
    })(this);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      opt = _ref[_i];
      _fn();
    }
    console.log('made keymode input');
    self = this;
    this.keymode_input.addEventListener('input', function(event) {
      var kf, _fn1, _j, _len1, _ref1;
      event.preventDefault();
      self.keymode = this.value;
      console.log('clearing');
      self.clear_views();
      console.log(self.views);
      _ref1 = self.kfs;
      _fn1 = (function(_this) {
        return function(kf) {
          console.log(kf);
          console.log(kf[_this.value] != null);
          if (kf[_this.value] != null) {
            return self.createView(kf);
          }
        };
      })(this);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        kf = _ref1[_j];
        _fn1(kf);
      }
      self.clear_header();
      self.create_header();
      return self.render();
    });
    console.log('bound keymode input');
    this.add_button = document.createElement('button').set('id', 'add').set('innerHTML', '+');
    this.add_button.classList.add('button');
    this.add_button.addEventListener('click', (function(_this) {
      return function(event) {
        event.preventDefault();
        _this.add();
        return _this.table.appendChild(last(_this.views).render().row);
      };
    })(this));
    this.save_button = document.createElement('button').set('id', 'save').set('innerHTML', 'save');
    this.save_button.classList.add('button');
    this.save_button.addEventListener('click', function(event) {
      event.preventDefault();
      return chrome.runtime.sendMessage({
        type: 'set',
        kfs: self.kfs,
        keymode: self.keymode
      }, (function(_this) {
        return function(resp) {
          var html, state;
          if (resp) {
            state = 'button-success';
            html = 'saved!';
          } else {
            state = 'button-failure';
            html = 'failed!';
          }
          _this.classList.add(state);
          _this.innerHTML = html;
          return window.setTimeout((function() {
            _this.classList.remove(state);
            return _this.innerHTML = 'save';
          }), 1000);
        };
      })(this));
    });
    console.log('added EventListeners');
    this.create_header();
    return this;
  };

  KFTable.prototype.render = function() {
    var view, _i, _j, _len, _len1, _ref, _ref1;
    console.log('rendering KFTable');
    this.table.appendChild(this.head_tr);
    console.log('rendered tr');
    _ref = this.views;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      view = _ref[_i];
      view.render();
    }
    _ref1 = this.views;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      view = _ref1[_j];
      this.table.appendChild(view.row);
    }
    if (this.save_button.parentNode == null) {
      this.table.parentNode.appendChild(this.save_button);
    }
    return this;
  };

  return KFTable;

})();

Options = (function() {
  function Options() {
    var self;
    chrome.runtime.sendMessage({
      type: 'init_options'
    }, (function(_this) {
      return function(resp) {
        var kf, _i, _len, _ref;
        _this.mode = resp.mode;
        _this.color = resp.color;
        console.log('got keymode %s', resp.keymode);
        _this.table = new KFTable($('#keyframes'), resp.keymode);
        _ref = resp.kfs;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          kf = _ref[_i];
          _this.table.add(kf);
        }
        _this.table.create().render();
        $('#color').value = C.rgb_to_hex(resp.color);
        $('#mode').checked = _this.mode === 'auto';
        $('#auto_opac-toggle').checked = resp.auto_opac;
        return _this.toggle_slides();
      };
    })(this));
    this.port = chrome.runtime.connect({
      name: 'options'
    });
    this.port.onMessage.addListener(function(msg) {
      if (msg.type === 'set auto_opac') {
        return $('#auto_opac-toggle').checked = msg.value;
      }
    });
    self = this;
    $('#color').addEventListener('input', function(event) {
      event.preventDefault();
      self.color = C.hex_to_rgb(this.value);
      return chrome.runtime.sendMessage({
        type: 'set',
        color: self.color
      });
    });
    $('#mode').addEventListener('click', function(event) {
      self.mode = this.checked ? 'auto' : 'manual';
      return chrome.runtime.sendMessage({
        type: 'set',
        mode: self.mode
      }, (function(_this) {
        return function(resp) {
          if (chrome.runtime.lastError == null) {
            return self.toggle_slides();
          } else {
            console.log('ERROR when setting mode!');
            return console.log(chrome.runtime.lastError);
          }
        };
      })(this));
    });
    $('#auto_opac-toggle').addEventListener('click', function(event) {
      return chrome.runtime.sendMessage({
        type: 'set',
        auto_opac: this.checked
      }, (function(_this) {
        return function(resp) {
          if (chrome.runtime.lastError != null) {
            console.log('ERROR when setting auto_opac!!');
            return console.log(chrome.runtime.lastError);
          }
        };
      })(this));
    });
  }

  Options.prototype.mode = 'auto';

  Options.prototype.color = {};

  Options.prototype.toggle_slides = function() {
    $('#auto').classList.toggle('active', this.mode === 'auto');
    return $('#manual').classList.toggle('active', this.mode === 'manual');
  };

  return Options;

})();

module.exports = Options;


},{"./color_helpers.coffee":1,"./keyframes.coffee":3}]},{},[4])