(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var $, $$, addKeyframe, default_frames, val;

$ = document.querySelector.bind(document);

$$ = document.querySelectorAll.bind(document);

val = function(obj) {
  return obj.value;
};

default_frames = {
  time: {
    key_value: "00:00",
    option: "temperature",
    value: 2700
  },
  altitude: {
    key_value: 0,
    option: "temperature",
    value: 2700
  }
};

$('#add-keyframe').addEventListener('click', function(event) {
  event.preventDefault();
  return addKeyframe(default_frames[val($('#key-type'))]);
});

$('#key-type').addEventListener('input', function(event) {
  var el, _i, _len, _ref, _results;
  _ref = $$('.trigger-input');
  _results = [];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    el = _ref[_i];
    _results.push((function() {
      return el.value = default_frames[val($('#key-type'))].key_value;
    })());
  }
  return _results;
});

chrome.storage.local.get('keyframes', (function(_this) {
  return function(item) {
    var frame, _i, _len, _ref, _results;
    console.log(item.keyframes);
    $('#key-type').value = item.keyframes[0].key_type;
    _ref = item.keyframes;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      frame = _ref[_i];
      _results.push(addKeyframe(frame));
    }
    return _results;
  };
})(this));

addKeyframe = function(frame) {
  var button, del, input, opt, option, row, select, trigger, value, _fn, _i, _len, _ref;
  row = document.createElement('tr');
  trigger = document.createElement('th');
  trigger.classList.add('keyframe-trigger');
  input = document.createElement('input');
  input.classList.add('trigger-input');
  if (frame.key_type === val($('#key-type'))) {
    input.value = frame.key_value;
  } else {
    input.value = default_frames[val($('#key-type'))].key_value;
  }
  row.appendChild(trigger).appendChild(input);
  option = document.createElement('th');
  select = document.createElement('select');
  _ref = ['color', 'temperature', 'opacity'];
  _fn = function() {
    var el;
    el = document.createElement('option');
    el.value = opt;
    el.innerHTML = opt;
    if (opt === frame.option) {
      el.selected = true;
    }
    return select.appendChild(el);
  };
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    opt = _ref[_i];
    _fn();
  }
  row.appendChild(option).appendChild(select);
  value = document.createElement('th');
  input = document.createElement('input');
  input.type = 'number';
  input.value = frame.value;
  row.appendChild(value).appendChild(input);
  del = document.createElement('th');
  button = document.createElement('button');
  button.innerHTML = "-";
  row.appendChild(del).appendChild(button);
  button.addEventListener('click', function(event) {
    event.preventDefault();
    return row.parentNode.removeChild(row);
  });
  return $('#keyframes').appendChild(row);
};


},{}]},{},[1])