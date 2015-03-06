// Include Express
var express = require('express');
// Initialize the Router
var router = express.Router();
var url = require('url');

// Setup the Route
router.get('/stuff', function (req, res) {

    // show the request body in the command line
    console.log(req.url);
    res.send(req.body);

    // return a json response to angular
    // res.json({
    //     'msg': 'success!'
    // });
});

// Setup the route for handling 'special' posts
router.post('/stuff', function (req, res) {
	console.log(req.body);
	res.json({name: 'Wasfi', talent: 'Awesomeness'});
    // res.json({
    //     'msg': 'this was posted to /signup/special'
    // });
});

// Expose the module
module.exports = router;