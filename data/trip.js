var mongoose = require('mongoose');
exports.Trip = mongoose.model('Trip', {
    start: {
               lat: Number,
               lng: Number
           },
    end: {
             lat: Number,
             lng: Number
         },
    hr: Number,
    min: Number,
    status: String,
    crn: String
});
