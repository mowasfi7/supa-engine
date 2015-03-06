module.exports = function (app) {
    app.use('/signup', require('./routes/signup'));
    app.use('/supapi', require('./routes/supapi'));
    app.use('/users', require('./routes/users'));
}