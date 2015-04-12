var express = require('express');
var router = express.Router();
var engine = require('../../engine/supervalu');

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