//function callback(position) {
//    var latitude = position.coords.latitude;
//    var longitude = position.coords.longitude;
//    
//    var pos = document.createTextNode(latitude + ", " + longitude);
//    document.body.appendChild(pos);
//}
//navigator.geolocation.getCurrentPosition(callback);

var app = { 
    opacity: 0.5,
    temp: 3600,
    TUNGSTEN: 2700,     // altitude < 0 deg
    HALOGEN: 3600,      // altitude < 15 deg
    FLUORESCENT: 4500,  // altitude < 35 deg
    DAYLIGHT: 5400,     // altitude < 75 deg
    NOON: 6300          // otherwise
};

function overlay(tab) {
    var color = KtoRGB(app.temp);
    var rgba = Math.floor(color.r) + ", " + Math.floor(color.g) + ", " + Math.floor(color.b) + ", " + app.opacity;
    var tabid = tab ? tab.id : null;
    chrome.tabs.insertCSS(tabid, {
        code: "body:after { content: ''; height: 100vh; width: 100vw; z-index: 999999; position: fixed; background: rgba(" + rgba + "); top: 0; left: 0; pointer-events: none; }"
    });
}

// (ideal: based on time and location, updates app.temp to be used by overlay())
// based on time updates app.temp to be used by overlay()
function updateTemperature(location) {
    var date = new Date();
    var hour = date.getHours();
    var altitude;
    if (location === null) {
        altitude = get_sun_altitude(date, 0,0);
    }
    else {
        altitude = get_sun_altitude(date, location.coords.longitude, location.coords.latitude);
    }
    console.log("altitude of sun: " + altitude);
    if (altitude < 0) { app.temp = app.TUNGSTEN; }
    else if (altitude < 15) { app.temp = app.HALOGEN; }
    else if (altitude < 35) { app.temp = app.FLUORESCENT; }
    else if (altitude < 75) { app.temp = app.DAYLIGHT; }
    else { app.temp = app.NOON; }
    console.log('updated to ' + app.temp + 'K');
}

// refreshes overlay on all tabs
function updateTabs() {
    chrome.tabs.query({}, function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
            overlay(tabs[i]);
        }
    });
}

function update(alarm) {
    if (navigator.geolocation) {
        console.log("geolocation activated");
        navigator.geolocation.getCurrentPosition(updateTemperature, function err(e) {
            console.log(e);
        }, {});
    }
    else {
        console.log("no geolocation");
        updateTemperature();
    }
    updateTabs();
}

update();

chrome.alarms.create('update', { periodInMinutes: 20 });
chrome.alarms.onAlarm.addListener(update);

chrome.tabs.onCreated.addListener(overlay);
chrome.tabs.onUpdated.addListener(overlay);

chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name === 'app');

    // on closing the extension, apply final result to all tabs
    port.onDisconnect.addListener(function() {
        updateTabs();
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'get_current_opacity') {
        sendResponse({ opacity: app.opacity });
    }

    // only applies updates to current tab (for realtime updates)
    else if (request.type === 'update_current_opacity') {
        app.opacity = request.opacity;
        overlay(sender.tab);
    }
});


function KtoRGB(kelvin) {
    var red, green, blue;
    var temp = kelvin / 100;

    if (temp <= 66) { 
        red = 255; 
        green = temp;
        green = 99.4708025861 * Math.log(green) - 161.1195681661;

        if (temp <= 19) {
            blue = 0;
        }
        else {
            blue = temp-10;
            blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
        }
        
    }
    else {
        red = temp - 60;
        red = 329.698727446 * Math.pow(red, -0.1332047592);
        green = temp - 60;
        green = 288.1221695283 * Math.pow(green, -0.0755148492 );
        blue = 255;
    }

    return {
        r : (red   < 0) ? 0 : (red   > 255) ? 255 : red,
        g : (green < 0) ? 0 : (green > 255) ? 255 : green,
        b : (blue  < 0) ? 0 : (blue  > 255) ? 255 : blue
    }
}

// http://en.wikipedia.org/wiki/Declination_of_the_Sun using julian date,
// calculate ecliptic coordinates of the sun then, calculate equatorial
// coordinates which convert easily to horizontal coordinates, from which we
// get the ALTIDTUDE of the sun as desired
//
// takes longitude and latitude of observer position (geolocation)

function get_sun_altitude(date, longitude, latitude) {
    var JD,
        jdn,
        L, g, // intermediates 
        ecliptic_long, dist_to_sun,
        axial_tilt;

    JD = getJulianDate(date);
    jdn = JD - 2451545.0;

    L = between(0, 360, 280.460 + 0.9856474*jdn);
    g = between(0, 360, 357.528 + 0.9856003*jdn);

    // ecliptic coordinates (except beta which we don't need)
    ecliptic_long = L + 1.915*angle_sin(g) + 0.02*angle_sin(2*g);
    dist_to_sun = 1.00014 - 0.01671*angle_cos(g) - 0.00014*angle_cos(2*g);
    axial_tilt = 23.4;
    
    var right_ascension, declination, hour_angle;

    right_ascension = angle_atan(angle_cos(axial_tilt) * angle_tan(ecliptic_long));

    //// make sure right_ascension is in same quadrant as ecliptic_long
    while (angleToQuadrant(ecliptic_long) !== angleToQuadrant(right_ascension)) {
        right_ascension += 90;
        if (right_ascension > 360) {
            right_ascension -= 360;
        }
    }
    
    console.log("right ascension : " + right_ascension + " : OK, looks like degrees");

    hour_angle = between(0, 360, greenwich_sidereal_time(JD) - longitude - right_ascension);

    console.log("LHA : " + hour_angle);

    declination = angle_asin(angle_sin(axial_tilt) * angle_cos(ecliptic_long));

    altitude = angle_asin(angle_sin(longitude)*angle_sin(declination) + angle_cos(longitude)*angle_cos(declination)*angle_cos(hour_angle));

    return altitude;
}

// http://aa.usno.navy.mil/faq/docs/GAST.php
// julian date midnight is every .5 (half)
function greenwich_sidereal_time(jd) {
    // gmst : greenwich mean sidereal time
    // gast : greenwich apparent sidereal time
    var last_jd_midnight, UT_hours, d, d0, gmst, T, gast;

    // find last midnight jd0
    if (jd >= Math.floor(jd + 0.5)) {
        last_jd_midnight = Math.floor(jd - 1) + 0.5;
    }
    else {
        last_jd_midnight = Math.floor(jd) + 0.5;
    }

    UT_hours  = 24 * (jd - last_jd_midnight);

    d = jd - 2451545.0;
    d0 = last_jd_midnight - 2451545.0;
    //T = d / 36525;

    // in hours!
    gmst = 6.697374558 + 0.06570982441908*d0 + 1.00273790935*UT_hours; //+ 0.000026*T*T;
    gmst = between(0, 24, gmst);

    console.log("gmst : " + gmst);
    
    var eqeq, omega, L;

    omega = 125.04 - 0.052954*d;
    L = 280.47 + 0.98565*d;
    eqeq = angle_cos(23.4393 - 0.0000004*d) * (-0.000319*angle_sin(omega)) - 0.000024*angle_sin(2*L);

    console.log("eqeq : " + eqeq);
    
    // in hours!
    gast = gmst - eqeq;

    console.log("gast : " + gast*15);
    
    // gast -> local sidereal time done by adding or subtracting local longitude
    // in hours (degrees / 15). If local position is east of greenwich, then
    // add, else subtract.

    return gast * 15;
}

function angleToQuadrant(angle) {
    if (0 < angle && angle < 90) {
        return 1;
    }
    else if (angle < 180) {
        return 2;
    }
    else if (angle < 270) {
        return 3;
    }
    else {
        return 4;
    }
}

function between(min, max, value) {
    var step = max-min;
    while (value < min || max < value) {
        value += (value < min) ? step : -step;
    }

    return value;
}

function angle_sin(x) {
    return Math.sin(angleToRadians(x));
}

function angle_cos(x) {
    return Math.cos(angleToRadians(x));
}

function angle_tan(x) {
    return Math.tan(angleToRadians(x));
}

function angle_atan(x) {
    return radiansToAngle(Math.atan(x));
}

function angle_asin(x) {
    return radiansToAngle(Math.asin(x));
}

function angleToRadians(angle) {
    return angle * Math.PI / 180;
}

function radiansToAngle(rad) {
    return rad * 180 / Math.PI;
}

//http://en.wikipedia.org/wiki/Julian_date#Calculation
function getJulianDate(date) {
    var a, d, m, y, jdn, jd;

    a = (date.getMonth() < 2) ? 1 : 0; // 1 for feb and jan, 0 else
    y = date.getFullYear() + 4800 - a;
    m = (date.getMonth()+1) + 12 * a - 3; // 11 for feb, 0 for mar

    jdn = date.getDate() + Math.floor((153*m + 2)/5) + 365*y + Math.floor((y/4)) - Math.floor((y/100)) + Math.floor((y/400)) - 32045;

    return jdn + (date.getHours() - 12)/24 + date.getMinutes()/1440 + date.getSeconds()/86400;
}
