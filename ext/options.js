(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var $, $$, addTriggerInput, defaults, newKeyframe, val;

$ = document.querySelector.bind(document);

$$ = document.querySelectorAll.bind(document);

val = function(obj) {
  return obj.value;
};

defaults = {
  sun_altitude: 0,
  time: '00:00',
  color_temperature: 2700
};

$('#add-keyframe').addEventListener('click', (function(_this) {
  return function(event) {
    event.preventDefault();
    return newKeyframe();
  };
})(this));

addTriggerInput = function(trigger) {
  var input;
  input = document.createElement('input');
  if ('altitude' === val($('#key-type'))) {
    input.type = 'number';
    input.value = defaults.sun_altitude;
    trigger.innerHTML = 'deg: ';
  } else {
    input.type = 'time';
    input.value = defaults.time;
  }
  return trigger.appendChild(input);
};

newKeyframe = function() {
  var input, option, option1, option2, option3, row, select, trigger, value;
  row = document.createElement('tr');
  trigger = document.createElement('th');
  trigger.addClass('keyframe-trigger');
  row.appendChild(trigger);
  option = document.createElement('th');
  select = document.createElement('select');
  option1 = document.createElement('option');
  option1.value = 'color';
  option1.innerHTML = option1.value;
  option2 = document.createElement('option');
  option2.value = 'color temperature';
  option2.innerHTML = option2.value;
  option2.selected = true;
  option3 = document.createElement('option');
  option3.value = 'opacity';
  option3.innerHTML = option3.value;
  select.appendChild(option1);
  select.appendChild(option2);
  select.appendChild(option3);
  option.appendChild(select);
  row.appendChild(option);
  value = document.createElement('th');
  input = document.createElement('input');
  input.type = 'number';
  value.appendChild(input);
  row.appendChild(value);
  return $('#keyframes').appendChild(row);
};


},{}]},{},[1])