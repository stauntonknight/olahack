var winston = require('winston');
var request = require('request');
var Q = require('q');
var mongo = require('../data/mongodb.js');

var url = 'http://sandbox-t.olacabs.com/v1';
var token = 'cbffeb9923174ffb928c379bed17565b';

var olaengine = {
    header: 'ebe93d9bd96242c997e036e6405d6aa4',
    bookCab : function(lat, lng) {
        winston.info('Booking for ' + lat + ' ' + lng);
        var extension = '/bookings/create';
        var def = Q.defer();
        request.get({
            url: url + extension, 
            qs: {
                pickup_lat: lat,
                pickup_lng: lng,
                pickup_mode: 'NOW',
                category: 'sedan'
            },
            headers: {
                         "X-APP-TOKEN": token,
                         'Authorization': 'Bearer ' + olaengine.header
                     }
        }, function(err, res, body) {
            if (!err && body) {
                try {
                body = JSON.parse(body);
                } catch(err) {
                    def.reject();
                }
                if (!body.crn) {
                    console.log('NO CRN ' + body);
                    def.reject();
                }
                def.resolve(body);
                winston.info(body.crn);
            } else {
                winston.error(err);
                winston.error(res);
                def.reject();
            }
        });
        return def.promise;
    },
    getRunningRideCrn: function() {
        var extension = '/bookings/track_ride';
        var def = Q.defer();
        request.get({
            url: url + extension, 
            qs: {
            },
            headers: {
                         "X-APP-TOKEN": token,
                         'Authorization': 'Bearer ' + olaengine.header
                     }
            }, function(err, res, body) {
                if (!err && body) {
                    console.log("RESPONSE FROM OLA :" + body);
                    try {
                    body = JSON.parse(body);
                    } catch (err) {body = null;}
                    if (body && body.status == 'SUCCESS' && body.booking_status == "IN_PROGRESS") {
                        console.log('Resolving '+ body.crn);
                       def.resolve(body.crn); 
                    } else {
                        winston.error(body.status);
                        def.reject();
                    }
                } else {
                    winston.error(err);
                    winston.error(res);
                    def.reject();
                }
            });
            return def.promise;
    },

    getRunningRideEstimate: function() {
            console.log('Getting running rid');
            return exports.olaengine.getRunningRideCrn().then(function(crn) {
                  winston.info('Got CRN' + crn);
                  return exports.olaengine.getLatLng(crn).then(function(arr) {
                    winston.info('Got lat long' + arr);
                    winston.info('Getting estimate nw');
                    return exports.olaengine.getEstimate(arr[0], arr[1]);
                  });
            }, function(res) {
                console.log('results fail is ' + res);
            });
    },
    getLatLng: function(crn) {
                   var def = Q.defer();
                   winston.info('Getting lat long for ' + crn);
                   mongo.mongo.getTrip(crn).then(function(trip) {
                       winston.info('Got trip ' + trip);
                       def.resolve([trip.start, trip.end]);
                   }, function() {
                       winston.error('Trip not received');
                       def.reject();
                   });
                   return def.promise;
               },
    getEstimate: function(start, end) {
            var extension = '/products';
            var def = Q.defer();
            request.get({
                url: url + extension, 
                qs: {
                    pickup_lat: start.lat,
                    pickup_lng: start.lng,
                    drop_lat: end.lat,
                    drop_lng: end.lng,
                    category: 'sedan'
                },
                headers: {
                             "X-APP-TOKEN": token,
                         }
            }, function(err, res, body) {
                if (!err && body) {
                    body = JSON.parse(body);
                    if (body.ride_estimate) {
                        def.resolve(body.ride_estimate[0].travel_time_in_minutes);
                    } else {
                        winston.error(body.status);
                        def.reject();
                    }
                } else {
                    winston.error(err);
                    winston.error(res);
                    def.reject();
                }
            });
            return def.promise;
       }
};

exports.olaengine = olaengine;
