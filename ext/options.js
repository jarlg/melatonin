(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var Keyframe, KeyframeView, Models;

HTMLElement.prototype.set = function(attr, val) {
  this[attr] = val;
  return this;
};

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
      this.value = document.createElement('input').set('type', this.option_map[this.model.option]).set('value', this.model.value);
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


},{}],2:[function(require,module,exports){
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

M = require('./models.coffee');

Options = (function() {
  function Options(parent, models, views) {
    this.parent = parent;
    this.models = models != null ? models : [];
    this.views = views != null ? views : [];
    chrome.storage.local.get('keyframes', (function(_this) {
      return function(item) {
        var kf, _i, _len, _ref, _results;
        _ref = item.keyframes;
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
    var index;
    if (model == null) {
      model = new M.Keyframe();
    }
    this.models.push(model);
    this.views.push(new M.KeyframeView(model, this.parent));
    index = this.views.length - 1;
    return last(this.views).create().render()["delete"].addEventListener('click', (function(_this) {
      return function(event) {
        event.preventDefault();
        _this.models.splice(index, 1);
        return last(_this.views.splice(index, 1)).erase();
      };
    })(this));
  };

  return Options;

})();

app = new Options($('#keyframes'));


},{"./models.coffee":1}]},{},[2])