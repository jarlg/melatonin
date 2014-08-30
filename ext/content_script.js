(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var Overlay, overlay;

Overlay = require('./overlay.coffee');

overlay = new Overlay();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'set_color') {
    return overlay.update(request.opacity, request.color);
  }
});


},{"./overlay.coffee":2}],2:[function(require,module,exports){
'use strict';
var Overlay;

Overlay = (function() {
  function Overlay() {
    this.el = document.createElement('div');
    this.el.style["transition"] = "background-color 0.2s";
    this.el.style.width = "100vw";
    this.el.style.height = "100vh";
    this.el.style.position = "fixed";
    this.el.style.top = 0;
    this.el.style.left = 0;
    this.el.style["z-index"] = 9999999999;
    this.el.style["pointer-events"] = "none";
    document.body.appendChild(this.el);
    chrome.runtime.sendMessage({
      type: 'initialize'
    });
  }

  Overlay.prototype.update = function(opac, color) {
    console.log('setting color %s and opacity %s', color, opac);
    this.el.style["background-color"] = "rgba(" + color + ", " + opac + ")";
    return console.log('done.');
  };

  return Overlay;

})();

module.exports = Overlay;


},{}]},{},[1])