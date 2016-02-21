module.exports = function (app) {
	app.use('/supervalu', require('./routes/supervalu'));
	app.use('/tesco', require('./routes/tesco'));
	app.use('/aldi', require('./routes/aldi'));
	app.use('/search', require('./routes/search'));
	app.use('/autocomplete', require('./routes/autocomplete'));
}