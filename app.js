var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var db = require('./database');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

if (app.get('env') == 'production') {
    app.use(express.static(path.join(__dirname, '/dist')));
}

var router = require('./router')(app);

app.use(function (req, res, next) {
	console.log('Setting Allow Origin');
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:9000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.get('/', function (req, res) {
	res.send("<center><h1>Welcome to Supapi Server</h1></center>");
});

app.use(function(err, req, res, next) {
	console.log("In error handler");
    res.status(err.status || 500);
});

module.exports = app;