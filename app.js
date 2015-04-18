var express = require('express'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    compress = require('compression');

require('./database');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compress());

if (app.get('env') == 'production') {
    app.use(express.static(__dirname + '/dist'));
}

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
    console.log(err);
    res.status(err.status || 500);
});

require('./router')(app);
module.exports = app;