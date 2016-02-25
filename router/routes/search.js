var router = require('express').Router(),
	engine = require('../../engine/search');

router.get('/:keyword/:page/:count',
	function (req, res, next) {
		engine.fire(req.params)
		.then(function(result){
			res.json(result);
		})
		.catch(function(error){
			res.status(500).send(error);
		});
	}
);

module.exports = router;