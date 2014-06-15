(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var on_off_toggle, opacity_input;

opacity_input = document.getElementById('opacity');

on_off_toggle = document.getElementById('on-off-toggle');

chrome.storage.local.get(['on', 'opacity'], function(items) {
  opacity_input.value = items['opacity'];
  if (items['on']) {
    on_off_toggle.innerHTML = 'off';
    return on_off_toggle.style['background-color'] = "red";
  } else {
    on_off_toggle.innerHTML = 'on';
    return on_off_toggle.style['background-color'] = "green";
  }
});

opacity_input.addEventListener('input', function(event) {
  return chrome.storage.local.set({
    'opacity': opacity_input.value
  }, function() {});
});

on_off_toggle.addEventListener('click', function(event) {
  if (on_off_toggle.innerHTML === 'on') {
    on_off_toggle.innerHTML = 'off';
    on_off_toggle.style['background-color'] = "green";
    return chrome.storage.local.set({
      'on': true
    }, function() {});
  } else {
    on_off_toggle.innerHTML = 'on';
    on_off_toggle.style['background-color'] = "green";
    return chrome.storage.local.set({
      'on': false
    }, function() {});
  }
});


},{}]},{},[1])