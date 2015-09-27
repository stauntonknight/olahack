var utils = {};
utils.getCurrentLocation =  function(callback) {
    navigator.geolocation.getCurrentPosition(function(pos) {
        callback(pos.coords.latitude, pos.coords.longitude);
    });
};
