var express = require('express'),
	router = express.Router(),
	engine = require('../../engine/search');

router.get('/:keyword',
	function (req, res, next) {
		engine.fire(req.params.keyword)
		.then(function(result){
			res.json(result);
		})
		.catch(function(error){
			res.status(500).send(error);
		});
	}
);

module.exports = router;