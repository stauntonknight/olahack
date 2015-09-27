var mongoose = require('mongoose');
exports.Chore = mongoose.model('Chore', {
    title: String,
    resource: String,
    // In minutes.
    duration: Number
});
