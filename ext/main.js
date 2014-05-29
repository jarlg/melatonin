(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var helpers;

helpers = {
  between: function(min, max, ref) {
    while (ref < min) {
      ref += 360;
    }
    while (max < ref) {
      ref -= 360;
    }
    return ref;
  },
  angleToQuadrant: function(angle) {
    if (0 < angle && angle < 90) {
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
  }
};

module.exports = helpers;


},{}],2:[function(require,module,exports){
var jd;

jd = {
  get_julian: function(date) {
    var a, jdn, m, y;
    a = date.getMonth() < 2 ? 1 : 0;
    y = date.getFullYear() + 4800 - a;
    m = (date.getMonth() + 1) + 12 * a - 3;
    jdn = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    return jdn + (date.getHours() - 12) / 24 + date.getMinutes() / 1440 + date.getSeconds() / 86400;
  }
};

module.exports = jd;


},{}],3:[function(require,module,exports){
var S, T, altitude_to_temperature, app, css_code, get_current_rgba, insert_css, js_update_overlay, overlay, toggle_css, update, update_app, update_tabs, update_temperature;

T = require('./temperature_to_color.coffee');

S = require('./sun_altitude.coffee');

app = {
  opacity: 0.5,
  temperature: 3600,
  color: {},
  css: false,
  colors: {
    tungsten: 2700,
    halogen: 3600,
    fluorescent: 4500,
    daylight: 5400,
    noon: 6300
  }
};

css_code = function(rgba) {
  return "body:after { content: ''; height: 100vh; width: 100vw; z-index: 999999; position: fixed; background: rgba(" + rgba + "); top: 0; left: 0; pointer-events: none; }";
};

get_current_rgba = function() {
  var rgba;
  rgba = Math.floor(app.color.r) + ", ";
  rgba += Math.floor(app.color.g) + ", ";
  return rgba += Math.floor(app.color.b) + ", " + app.opacity;
};

altitude_to_temperature = function(altitude) {
  if (altitude < 0) {
    return app.colors.tungsten;
  } else if (altitude < 15) {
    return app.colors.halogen;
  } else if (altitude < 35) {
    return app.colors.fluorescent;
  } else if (altitude < 75) {
    return app.colors.daylight;
  } else {
    return app.colors.noon;
  }
};

insert_css = function(tabid) {
  console.log(tabid);
  return chrome.tabs.insertCSS(tabid, {
    code: css_code(get_current_rgba(), function() {})
  });
};

js_update_overlay = function(tabid) {
  return chrome.tabs.sendMessage(tabid, {
    type: 'update_color',
    rgba_string: get_current_rgba()
  }, function() {});
};

overlay = function(tab) {
  if (app.css) {
    return insert_css((tab != null ? tab.id : null));
  } else if (tab != null) {
    return js_update_overlay(tab.id);
  } else {
    return chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      return js_update_overlay(tabs[0].id);
    });
  }
};

update_tabs = function() {
  return chrome.tabs.query({}, function(tabs) {
    var tab, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = tabs.length; _i < _len; _i++) {
      tab = tabs[_i];
      _results.push(overlay(tab));
    }
    return _results;
  });
};

update_app = function(location) {
  update_temperature(location);
  return update_tabs();
};

update_temperature = function(location) {
  var altitude, date;
  date = new Date();
  altitude = S.get_sun_altitude(date, location.coords.longitude, location.coords.latitude);
  app.temperature = altitude_to_temperature(altitude);
  return app.color = T.get_color(app.temperature);
};

update = function(alarm) {
  if (navigator.geolocation) {
    return navigator.geolocation.getCurrentPosition(update_app, console.log, {});
  } else {
    return console.log("No geolocation. Can't update color temperature.");
  }
};

update();

chrome.alarms.create('update', {
  periodInMinutes: 20
});

chrome.alarms.onAlarm.addListener(update);

chrome.tabs.onUpdated.addListener(function(tabid, changeInfo, tab) {
  return overlay(tab);
});

chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name === 'app');
  return port.onDisconnect.addListener(update_tabs);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'get_current_opacity') {
    return sendResponse({
      opacity: app.opacity
    });
  } else if (request.type === 'get_current_color') {
    return sendResponse({
      rgba_string: get_current_rgba()
    });
  } else if (request.type === 'get_css_opt') {
    return sendResponse({
      css: app.css
    });
  } else if (request.type === 'update_current_opacity') {
    app.opacity = request.opacity;
    return overlay(sender.tab);
  } else if (request.type === 'update_css_opt') {
    if (app.css !== request.css) {
      app.css = request.css;
      toggle_css();
      return overlay(sender.tab);
    }
  }
});

toggle_css = function() {
  return chrome.tabs.query({}, function(tabs) {
    var tab, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = tabs.length; _i < _len; _i++) {
      tab = tabs[_i];
      _results.push((function(tab) {
        if (app.css) {
          return chrome.tabs.sendMessage(tab.id, {
            type: 'update_color',
            rgba_string: '0,0,0,0'
          });
        } else {
          return chrome.tabs.insertCSS(tab.id, {
            code: css_code('0,0,0,0')
          });
        }
      })(tab));
    }
    return _results;
  });
};


},{"./sun_altitude.coffee":4,"./temperature_to_color.coffee":5}],4:[function(require,module,exports){
var H, J, obj;

J = require('./julian_date.coffee');

H = require('./helpers.coffee');

obj = {
  get_sun_altitude: function(date, longitude, latitude) {
    var axial_tilt, declination, dist_to_sun, ecliptic_long, g, hour_angle, jd, jdn, l, right_ascension;
    jd = J.get_julian(date);
    jdn = jd - 2451545.0;
    l = H.between(0, 360, 280.460 + 0.9856474 * jdn);
    g = H.between(0, 360, 357.528 + 0.9856003 * jdn);
    ecliptic_long = l + 1.915 * H.angle_sin(g) + 0.02 * H.angle_sin(2 * g);
    dist_to_sun = 1.00014 - 0.01671 * H.angle_cos(g) - 0.00014 * H.angle_cos(2 * g);
    axial_tilt = 23.4;
    right_ascension = H.angle_atan(H.angle_cos(axial_tilt) * H.angle_tan(ecliptic_long));
    while (H.angleToQuadrant(ecliptic_long) !== H.angleToQuadrant(right_ascension)) {
      right_ascension += 90;
      if (right_ascension > 360) {
        right_ascension -= 360;
      }
    }
    hour_angle = H.between(0, 360, this.greenwich_sidereal_time(jd) - longitude - right_ascension);
    declination = H.angle_asin(H.angle_sin(axial_tilt) * H.angle_cos(ecliptic_long));
    return H.angle_asin(H.angle_sin(longitude) * H.angle_sin(declination) + H.angle_cos(longitude) * H.angle_cos(declination) * H.angle_cos(hour_angle));
  },
  greenwich_sidereal_time: function(jd) {
    var d, d0, eqeq, gast, gmst, l, last_jd_midnight, omega, ut_hours;
    if (jd >= Math.floor(jd + 0.5)) {
      last_jd_midnight = Math.floor(jd - 1) + 0.5;
    } else {
      last_jd_midnight = Math.floor(jd) + 0.5;
    }
    ut_hours = 24 * (jd - last_jd_midnight);
    d = jd - 2451545.0;
    d0 = last_jd_midnight - 2451545.0;
    gmst = 6.697374558 + 0.06570982441908 * d0 + 1.00273790935 * ut_hours;
    gmst = H.between(0, 24, gmst);
    omega = 125.04 - 0.052954 * d;
    l = 280.47 + 0.98565 * d;
    eqeq = H.angle_cos(23.4393 - 0.0000004 * d) * (-0.000319 * H.angle_sin(omega)) - 0.000024 * H.angle_sin(2 * l);
    gast = gmst - eqeq;
    return gast * 15;
  }
};

module.exports = obj;


},{"./helpers.coffee":1,"./julian_date.coffee":2}],5:[function(require,module,exports){
var obj;

obj = {
  get_color: function(temperature) {
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
      r: red < 0 ? 0 : red > 255 ? 255 : red,
      g: green < 0 ? 0 : green > 255 ? 255 : green,
      b: blue < 0 ? 0 : blue > 255 ? 255 : blue
    };
  }
};

module.exports = obj;


},{}]},{},[3])