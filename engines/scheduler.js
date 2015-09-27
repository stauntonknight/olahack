var PeriodicTask = require('periodic-task');
var mongo = require('../data/mongodb.js');
var olaengine = require('./olaengine.js');
var calendar = require('./googlecalendar.js');
var chore = require('../data/chores.js');
var winston = require('winston');
var mongoose = require('mongoose');

var delay = 6000;
var Chore = mongoose.model('Chore', chore.Chore);

exports.scheduler = {
    bookTripsTask: new PeriodicTask(delay, function() {
        winston.info('Running booktrip task...');
        mongo.mongo.getTripsToBook().then(function(items) {
            winston.info('Got some items...' + items.length);
            for (var i = 0; i < items.length; i++) {
                if (items[i].status == 'pending') {
                    winston.info('Booking cab now...');
                    var id = items[i]._id;
                    olaengine.olaengine.bookCab(
                        items[i].start.lat,
                        items[i].start.lng).then(function(body) {
                          winston.info('Booked...');
                          // Cab is booked, update the status.
                          console.log('Setting STATUS ' + body.crn);
                          if (!body.crn) return;
                          mongo.mongo.setStatus(id, 'scheduled', body.crn);
                        });
                }
            }
        });
    }),

    updateTripsTask: new PeriodicTask(delay, function() {
                         winston.info('Running update trip tasks');
                         olaengine.olaengine.getRunningRideCrn().then(function(crn) {
                             mongo.mongo.updateTask(crn, 'started');                          
                         });
                     }),
    updateCalendarChores: new PeriodicTask(delay, function() {
                              console.log("GETTING CALENDAR");
                              calendar.getEvents(function(results) {
                                  console.log("GOT  "  + results.length);
                                  for (var i = 0 ; i <results.length;i++) {
                                      if (!results[i].title || !results[i].duration) continue;
                                      console.log("Updating");
                                      Chore.update({
                                          title: results[i].title,
                                          duration: Number(results[i].duration),
                                          link: results[i].link
                                      }, {
                                          $set: {title: results[i].title}
                                      }, {
                                          upsert: true
                                      }, function(err,res) {console.log(err + ' ' + res)}
                                      );
                                  }
                              });

                          }),


    scheduleAll: function() {
                      exports.scheduler.bookTripsTask.run();
                      exports.scheduler.updateTripsTask.run();
                      exports.scheduler.updateCalendarChores.run();
                  }
};
