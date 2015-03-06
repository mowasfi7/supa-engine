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
    password: { type: String, required: true }
});

// The primary user model
var User = mongoose.model('User', userSchema);

module.exports = User;