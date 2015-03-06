/**
 * Our Database Interface
 */
var mongoose = require('mongoose');
var UserModel = require('./schemas/users');

// If we're in development...
if (process.env.NODE_ENV === 'development') {
    mongoose.connect('mongodb://wasfi:mongopass@ds039211.mongolab.com:39211/supamarket');
}
else{
	mongoose.connect('mongodb://wasfi:mongopass@ds039211.mongolab.com:39211/supamarket');
}

// get an instance of our connection to our database
var db = mongoose.connection;

// Logs that the connection has successfully been opened
db.on('error', console.error.bind(console, 'connection error:'));
// Open the connection
db.once('open', function callback () {
  console.log('Database Connection Successfully Opened');
});

exports.users = UserModel;