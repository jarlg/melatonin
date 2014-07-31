(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var colorpicker, custom_toggle, on_off_toggle, opacity_input;

opacity_input = document.getElementById('opacity');

on_off_toggle = document.getElementById('on-off-toggle');

custom_toggle = document.getElementById('custom-toggle');

colorpicker = document.getElementById('colorpicker');

chrome.storage.local.get(['on', 'opacity', 'custom', 'custom_color'], function(items) {
  on_off_toggle.checked = items.on;
  custom_toggle.checked = items.custom;
  opacity_input.value = items.opacity;
  return colorpicker.value = items.custom_color;
});

opacity_input.addEventListener('input', function(event) {
  return chrome.storage.local.set({
    'opacity': this.value
  }, function() {});
});

colorpicker.addEventListener('input', function(event) {
  return chrome.storage.local.set({
    'custom_color': this.value
  }, function() {});
});

on_off_toggle.addEventListener('click', function(event) {
  return chrome.storage.local.set({
    'on': this.checked
  }, function() {});
});

custom_toggle.addEventListener('click', function(event) {
  return chrome.storage.local.set({
    'custom': this.checked
  }, function() {});
});


},{}]},{},[1])