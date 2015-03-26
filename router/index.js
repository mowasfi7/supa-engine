module.exports = function (app) {
	app.use('/supapi', require('./routes/supapi'));
	app.use('/supervalu', require('./routes/supervalu'));
}