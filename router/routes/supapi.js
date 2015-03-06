// Include Express
var express = require('express');
// Initialize the Router
var router = express.Router();

// Setup the Route
router.get('/stuff', function (req, res) {

    // show the request body in the command line
    console.log("Get: " + req.body);
    res.send("Got from stuff: " + req.body);

    // return a json response to angular
    // res.json({
    //     'msg': 'success!'
    // });
});

// Setup the route for handling 'special' posts
router.post('/stuff', function (req, res) {
	console.log("Post: " + req.body);
	res.json({name: 'Wasfi', talent: 'Awesomeness'});
    // res.json({
    //     'msg': 'this was posted to /signup/special'
    // });
});

router.post('/test', function (req, res) {
    console.log(req.body);
    var param = req.body.msg;
    if(param == "good"){
        res.json({type: 'Good', nature: 'Also good'});
    }
    else if (param == "bad"){
        res.json({type: 'Bad', nature: 'Heck'});
    }
    else{
        res.status(500).send('Unrecognized request');
    }
});

// Expose the module
module.exports = router;