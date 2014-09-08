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


},{}],3:[function(require,module,exports){
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
        return function(opt) {
          return _this.direction.appendChild(document.createElement('option')).set('innerHTML', opt).set('selected', (_this.direction_map[opt] === _this.model.direction ? true : void 0));
        };
      })(this);
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        opt = _ref1[_j];
        _fn1(opt);
      }
      this["delete"] = document.createElement('button').set('innerHTML', '-');
      this["delete"].classList.add('delete', 'button');
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
                return self.model[input] = self.direction_map[this.value];
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
    if (next === last) {
      return last.value;
    }
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
      return kf.direction * dir <= 0;
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
      return kf.direction * dir <= 0;
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
var $, $$, C, M, Options, last, val;

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

C = require('./color_helpers.coffee');

Options = (function() {
  function Options(kfs, kfviews, mode, color) {
    var self;
    this.kfs = kfs != null ? kfs : [];
    this.kfviews = kfviews != null ? kfviews : [];
    this.mode = mode != null ? mode : 'auto';
    this.color = color != null ? color : {};
    chrome.runtime.sendMessage({
      type: 'init_options'
    }, (function(_this) {
      return function(resp) {
        var kf, _i, _len, _ref, _results;
        _this.mode = resp.mode;
        _this.color = resp.color;
        $('#color').value = C.rgb_to_hex(resp.color);
        $('#mode').checked = _this.mode === 'auto';
        _this.toggle_slides();
        _ref = resp.kfs.sort(function(a, b) {
          return a.altitude - b.altitude;
        });
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
      console.log(self.kfs);
      event.preventDefault();
      return chrome.runtime.sendMessage({
        type: 'set',
        kfs: self.kfs
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
  }

  Options.prototype.toggle_slides = function() {
    $('#auto').classList.toggle('active', this.mode === 'auto');
    return $('#manual').classList.toggle('active', this.mode === 'manual');
  };

  Options.prototype.add = function(model) {
    if (model == null) {
      model = new M.Keyframe();
    }
    this.kfs.push(model);
    this.kfviews.push(new M.KeyframeView(model, $('#keyframes')));
    return last(this.kfviews).create().render()["delete"].addEventListener('click', (function(_this) {
      return function(event) {
        var index;
        event.preventDefault();
        index = _this.kfs.indexOf(model);
        _this.kfs.splice(index, 1);
        return last(_this.kfviews.splice(index, 1)).erase();
      };
    })(this));
  };

  return Options;

})();

module.exports = Options;


},{"./color_helpers.coffee":1,"./keyframes.coffee":3}]},{},[4])