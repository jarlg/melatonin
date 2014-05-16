(function (window, document) {
    var opacity_input = document.getElementById('opacity');
    //var opacity_value = document.getElementById('opacity-value');
    

    chrome.runtime.sendMessage({
        type: 'get_current_opacity'
    },
    function init(response) {
        //opacity_value.innerHTML = response.opacity;
        opacity_input.value = response.opacity;
    });

    function realtime_update() {
        chrome.runtime.sendMessage({
            type: 'update_current_opacity',
            opacity: opacity_input.value
        });
    }

    opacity_input.addEventListener('input', function realtimeSlide(event) {
        //opacity_value.innerHTML = opacity_input.value;
        realtime_update();
    });

    // hack to let main.js know when extension window closes
    var port = chrome.runtime.connect({ name: 'app' });

})(window, document);
