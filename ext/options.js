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
  },
  last: function(arr) {
    if (arr.length > 0) {
      return arr[arr.length - 1];
    } else {
      return null;
    }
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
    function Keyframe(key_value, option, value, direction) {
      this.key_value = key_value != null ? key_value : 0;
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
      this.key_value = document.createElement('input').set('type', 'number').set('value', this.model.key_value);
      this.key_value.classList.add('key-input');
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
      _ref2 = ['key_value', 'option', 'value', 'direction', 'delete'];
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
  get_color: function(kfs, alt, dir) {
    var attr, kf, lkf, nkf, rgb, _fn, _fn1, _i, _j, _len, _len1, _ref;
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
      return a.key_value - b.key_value;
    });
    lkf = this._get_last_kf(kfs, alt, dir);
    nkf = this._get_next_kf(kfs, alt, dir);
    rgb = {};
    _ref = ['r', 'g', 'b'];
    _fn1 = (function(_this) {
      return function(attr) {
        return rgb[attr] = H.interpolate(alt, lkf.key_value, parseInt(lkf.value[attr]), nkf.key_value, parseInt(nkf.value[attr])).toFixed(0);
      };
    })(this);
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      attr = _ref[_j];
      _fn1(attr);
    }
    return rgb;
  },
  _get_last_kf: function(kfs, alt, dir) {
    var cands;
    cands = kfs.filter(function(kf) {
      return kf.direction * dir >= 0 && (alt - kf.key_value) * dir >= 0;
    });
    if (cands.length > 0) {
      if (dir) {
        return H.last(cands);
      } else {
        return cands[0];
      }
    }
    cands = kfs.filter(function(kf) {
      return kf.direction === -dir;
    });
    if (dir) {
      return cands[0];
    } else {
      return H.last(cands);
    }
  },
  _get_next_kf: function(kfs, alt, dir) {
    var cands;
    cands = kfs.filter(function(kf) {
      return kf.direction * dir >= 0 && (kf.key_value - alt) * dir >= 0;
    });
    if (cands.length > 0) {
      if (dir) {
        return cands[0];
      } else {
        return H.last(cands);
      }
    }
    cands = kfs.filter(function(kf) {
      return kf.direction === -dir;
    });
    if (dir) {
      return H.last(cands);
    } else {
      return cands[0];
    }
  }
};

module.exports = obj;


},{"./color_helpers.coffee":1,"./helpers.coffee":2}],4:[function(require,module,exports){
'use strict';
var $, $$, M, Options, app, last, val;

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

Options = (function() {
  function Options(parent, models, views) {
    var self;
    this.parent = parent;
    this.models = models != null ? models : [];
    this.views = views != null ? views : [];
    this.prio = {
      temperature: 2,
      color: 1
    };
    chrome.storage.local.get(['keyframes', 'latitude', 'longitude'], (function(_this) {
      return function(items) {
        var kf, _i, _len, _ref, _results;
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


},{"./keyframes.coffee":3}]},{},[4])