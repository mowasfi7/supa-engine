/**
 * Our Database Interface
 */
var mongoose = require('mongoose');
mongoose.set('debug', true);
var UserModel = require('./schemas/users');

// Connections
var developmentDb = 'mongodb://wasfi:mongopass@ds039211.mongolab.com:39211/supamarket';
var productionDb = 'mongodb://wasfi:mongopass@ds039211.mongolab.com:39211/supamarket';
var usedDb;

// If we're in development...
if (process.env.NODE_ENV === 'development') {
    // set our database to the development one
    usedDb = developmentDb;
    // connect to it via mongoose
    mongoose.connect(usedDb, {safe:false});
}

// If we're in production...
if (process.env.NODE_ENV === 'production') {
    // set our database to the development one
    usedDb = productionDb;
    // connect to it via mongoose
    mongoose.connect(usedDb, {safe:false});
}

// get an instance of our connection to our database
var db = mongoose.connection;

// Logs that the connection has successfully been opened
db.on('error', console.error.bind(console, 'connection error:'));
// Open the connection
db.once('open', function callback () {
  console.log('Database Connection Successfully Opened at ' + usedDb);
});

exports.users = UserModel;