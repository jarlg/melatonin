//function callback(position) {
//    var latitude = position.coords.latitude;
//    var longitude = position.coords.longitude;
//    
//    var pos = document.createTextNode(latitude + ", " + longitude);
//    document.body.appendChild(pos);
//}
//navigator.geolocation.getCurrentPosition(callback);

var app = { 
    temp: 3700,
    opacity: 0.5,
    map: {
        5: 2700,
        6: 5400,
        8: 6000,
        12: 5400,
        15: 4800,
        17: 4000,
        19: 3400,
        22: 2900
    }
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
function updateTemperature() {
    var hour = new Date().getHours();
    console.log("hour: " + hour);
    for (var key in app.map) {
        if (app.map.hasOwnProperty(key)) {
            console.log("comparing " + hour + " to " + app.map[key]);
            if (hour < key) { 
                app.temp = app.map[key];
                console.log("upated to " + app.temp);
                break;
            }
        }
    }
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
    updateTemperature();
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
