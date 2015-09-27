var mongoose = require('mongoose');
exports.Booking = mongoose.model('Booking', {
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
    status: string
});
