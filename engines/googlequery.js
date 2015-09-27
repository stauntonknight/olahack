var Q = require('q');
var request = require('request');
var winston = require('winston');

var API_KEY = 'AIzaSyB-nVXhYCmgEfmD6Vw_czwx0DlbiqV4nm0';
var GEOAPI = 'https://maps.googleapis.com/maps/api/geocode/json';

exports.googlequery = {
    getLatLong: function(place) {
        var defer = Q.defer();
        winston.info('Getting lat long for ' + place);
        request.get({
            url: GEOAPI,
            qs: {
                address: place,
                key: API_KEY 
            }
        }, function(err, result) {
            if (err) {
                console.log(err);
                defer.rej();
                return;
            }
            var body = JSON.parse(result.body);
            if (body.results && body.results.length != 0) {
                winston.info('results found for google query');
                defer.resolve([
                    body.results[0].geometry.location.lat,
                    body.results[0].geometry.location.lng]);
            } else {
                winston.error(body);
                defer.reject('Rejected');
            }
        });
        return defer.promise;
    }
};
