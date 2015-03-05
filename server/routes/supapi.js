// Include Express
var express = require('express');
// Initialize the Router
var router = express.Router();

// Setup the Route
router.get('/stuff', function (req, res) {

    // show the request body in the command line
    console.log("Get: " + req.params['msg']);
    res.send("Got from stuff");

    // return a json response to angular
    // res.json({
    //     'msg': 'success!'
    // });
});

// Setup the route for handling 'special' posts
router.post('/stuff', function (req, res) {
	console.log("Post: " + req.params.msg);
	res.json({name: 'Wasfi', talent: 'Awesomeness'});
    // res.json({
    //     'msg': 'this was posted to /signup/special'
    // });
});

// Expose the module
module.exports = router;