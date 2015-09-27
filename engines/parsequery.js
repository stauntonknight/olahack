var Q = require('q');
var googlequery = require('./googlequery.js');
var winston = require('winston');

var PLACE_TIME_REGEX = /visit (.*) from (.*) at ([01]\d|2[0-3]):?([0-5]\d)/i

var queryParser = {};

/**
 * Returns a promise from a query.
 */
queryParser.parse = function(query) {
    console.log('Trying to match ' + query);
    var matches = query.match(PLACE_TIME_REGEX);
    var def = Q.defer();
    if (matches) {
        console.log('Found matches');
        var dest = matches[1];
        var source = matches[2];
        var hr = matches[3]
        var min = matches[4];
        Q.all([
                googlequery.googlequery.getLatLong(source),
                googlequery.googlequery.getLatLong(dest)
              ]).done(
                  function(latlngs) {
                    def.resolve([latlngs[0], latlngs[1], hr, min]);
                  },
                  function() {
                    winston.error('rejected');
                    def.reject();
                  });
    } else {
        winston.log('No matches found');
    }
    return def.promise;
};

var placeEvent = function(lat, lng, time) {
    this.lat = lat;
    this.lng = lng;
    this.time = time;
};

exports.queryParser = queryParser;
