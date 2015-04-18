var express = require('express'),
	router = express.Router(),
	engine = require('../../engine/tesco');


router.get('/pullproducts',
	function (req, res, next) {
		engine.fire()
		.then(function(result){
			res.send(result);
		})
		.catch(function(error){
			res.status(500).send(error);
		});
	}
);

module.exports = router;