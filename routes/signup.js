// Include Express
var express = require('express');
// Initialize the Router
var router = express.Router();

// Setup the Route
router.post('/', function (req, res) {

    // show the request body in the command line
    console.log(req.body);

    // return a json response to angular
    res.json({
        'msg': 'success!'
    });
});

// Setup the route for handling 'special' posts
router.post('/special', function (req, res) {
    res.json({
        'msg': 'this was posted to /signup/special'
    });
});

// Expose the module
module.exports = router;