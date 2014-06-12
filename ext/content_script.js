(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var init_overlay, update_color;

init_overlay = function() {
  var overlay;
  overlay = document.createElement('div');
  overlay.style["transition"] = "background-color 0.2s";
  update_color(overlay);
  overlay.id = 'melatonin-overlay';
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style["z-index"] = 99999;
  overlay.style["pointer-events"] = "none";
  return document.body.appendChild(overlay);
};

update_color = function(element) {
  if (element == null) {
    element = document.getElementById('melatonin-overlay');
  }
  return chrome.storage.local.get(['rgb', 'opacity'], function(items) {
    var rgba_string;
    rgba_string = items['rgb'] + ", " + items['opacity'];
    return element.style['background-color'] = "rgba(" + rgba_string + ")";
  });
};

init_overlay();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'update_color') {
    return update_color();
  }
});


},{}]},{},[1])