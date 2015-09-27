var trip = require('./trip.js');
var chore = require('./chores.js');
var mongoose = require('mongoose');
var winston = require('winston');
var Q = require('q');

var Trip = mongoose.model('Trip', trip.Trip);
var Chore = mongoose.model('Chore', chore.Chore);

mongoose.connect('mongodb://localhost/olahack');

var mongof = {
    createTrip: function(startll, endll, hr, min) {
                    winston.info('Trying to save data.');
                    var def = Q.defer();
                    var trip = new Trip({
                        start: {lat: startll[0], lng:startll[1]},
                        end: {lat:endll[0], lng:endll[1]},
                        hr: Number(hr),
                        min: Number(min),
                        status: 'pending',
                        crn: ''
                    });
                    trip.save(function(err) {
                        if (err) {
                            winston.error('Error while saving :' + err);
                            def.reject();
                        } else {
                            winston.info('Saved');
                            def.resolve();
                        }
                    });
                    return def.promise;
                },
    getTripsToBook: function() {
                 // Gets trips to be scheduled for next half an hour.
                 var date = new Date();
                 var hour = date.getHours();
                 var min = date.getMinutes();
                 console.log('Now :' + hour + ' ' + min);
                 min = min + 30;
                 if (min < 0) {
                     min = min + 60;
                     hour--;
                 }
                 if (min >= 60) {
                     hour++;
                     min = min - 60;
                 }
                 winston.info('looking for ' + hour + ' ' + min);
                 var def = Q.defer();
                 Trip.find({
                     hr : {$lte: hour},
                     crn: {$eq:''}
                 }, function(err, res) {
                     if (!err) {
                         winston.info('success');
                         def.resolve(res);
                     } else {
                         winston.info('error' + err);
                         def.reject();
                     }
                 });
                 return def.promise;
             },
    getBookings : function() {
                 var def = Q.defer();
                 Trip.find({
                     crn : {$ne :'' }
                 }, function(err, res) {
                     if (!err) {
                         winston.info('success');
                         def.resolve(res);
                     } else {
                         winston.info('error');
                         def.reject();
                     }
                 });
                 return def.promise;
               },
    getAllTasks: function() {
                 var def = Q.defer();
                 Trip.find({
                     status :{ $ne: 'started'}
                 }, function(err, res) {
                     if (!err) {
                         winston.info('success');
                         def.resolve(res);
                     } else {
                         winston.info('error');
                         def.reject();
                     }
                 });
                 return def.promise;
               },

    setStatus: function(id, status, crn) {
                 winston.info('Setting ' + id + status + crn);
                 Trip.update({
                     _id: {$eq: id}
                 }, {
                     $set: {
                         'crn': crn,
                         'status': status
                     }
                 }, undefined, function(err, res) {
                     winston.info(err);
                     winston.info(res);
                 });
               },
    createChore: function(title, link, duration) {
                winston.info('Trying to save chore.');
                var def = Q.defer();
                var chore = new Chore({
                    title: title,
                    link: link,
                    duration: duration
                });
                chore.save(function(err) {
                    if (err) {
                        winston.error('Error while saving chore :' + err);
                        def.reject();
                    } else {
                        winston.info('Saved');
                        def.resolve();
                    }
                });
                return def.promise;
            },
    getChores: function() {
                 var def = Q.defer();
                 Chore.find({
                 }, function(err, res) {
                     if (!err) {
                         winston.info('success');
                         def.resolve(res);
                     } else {
                         winston.info('error');
                         def.reject();
                     }
                 });
                 return def.promise;
               },
    updateTask: function(crn, status) {
                    Trip.update({
                     crn: {$eq:crn}
                    }, {
                     $set: {
                         status: status
                    }
                 }, undefined, function(err, res) {
                     winston.error(err);
                     winston.info(res);
                 });
                },
    getTrip: function(crn) {
                 var def = Q.defer();
                 winston.info('Getting trip for ' + crn);
                 Trip.find({
                     crn: {$eq:crn}
                 }, function(err, res) {
                     if (!err && res.length == 1) {
                         winston.info('success getTrip' + res);
                         def.resolve(res[0]);
                     } else {
                         winston.info('error getTrip ' + err);
                         def.reject('Error getting tri');
                     }
                 });
                 return def.promise;
             },
    deleteChore: function(title) {
                 Chore.findOne({
                     title: title
                 },function(err, model) {
                     if (err) return;
                     model.remove(function(err) {});
                 });
                 }
};

exports.mongo = mongof;
