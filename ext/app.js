(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var opacity_input, sun_altitude;

opacity_input = document.getElementById('opacity');

sun_altitude = document.getElementById('altitude');

chrome.storage.local.get(['opacity', 'altitude'], function(items) {
  opacity_input.value = items['opacity'];
  return sun_altitude.innerHTML = items['altitude'].toFixed(0);
});

opacity_input.addEventListener('input', function(event) {
  return chrome.storage.local.set({
    'opacity': opacity_input.value
  }, function() {});
});

sun_altitude.addEventListener('click', function(event) {
  return chrome.runtime.sendMessage({
    type: 'update'
  }, function() {
    return chrome.storage.local.get('altitude', function(item) {
      return sun_altitude.innerHTML = item['altitude'];
    });
  });
});


},{}]},{},[1])