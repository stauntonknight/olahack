exports.Trip = mongoose.model('Trip', {
    start: String,
    end: String,
    hr: Number,
    min: Number
});
