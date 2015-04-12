module.exports = function (app) {
	app.use('/supervalu', require('./routes/supervalu'));
	app.use('/tesco', require('./routes/tesco'));
}