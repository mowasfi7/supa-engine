module.exports = function (app) {
	app.use('/crawl', require('./routes/crawl'));
	app.use('/search', require('./routes/search'));
	app.use('/autocomplete', require('./routes/autocomplete'));
}