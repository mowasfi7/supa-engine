/**
 * Our Schema for Users
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define the User Schema
var userSchema = new Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profile: {} // for extra information you may / may not want
});

// A method that's called every time a user document is saved..
userSchema.pre('save', function (next) {

    var user = this;

    // If the password hasn't been modified, move along...
    if (!user.isModified('password')) {
        return next();
    }
});

// Password verification helper
userSchema.methods.comparePassword = function (triedPassword, cb) {
};

// The primary user model
var User = mongoose.model('User', userSchema);

module.exports = User;