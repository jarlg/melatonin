(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var overlay, update_color;

overlay = document.createElement('div');

overlay.id = 'melatonin-overlay';

overlay.style.width = "100vw";

overlay.style.height = "100vh";

overlay.style.position = "fixed";

overlay.style.top = 0;

overlay.style.left = 0;

overlay.style["z-index"] = 99999;

overlay.style["pointer-events"] = "none";

document.body.appendChild(overlay);

update_color = function(rgba_string) {
  return document.getElementById('melatonin-overlay').style.backgroundColor = "rgba(" + rgba_string + ")";
};

chrome.runtime.sendMessage({
  type: 'get_current_color'
}, function(r) {
  return update_color(r.rgba_string);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'update_color') {
    return update_color(request.rgba_string);
  }
});


},{}]},{},[1])