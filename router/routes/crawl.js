var router = require('express').Router(),
	Q = require('q'),
	sv_engine = require('../../engine/supervalu'),
	ts_engine = require('../../engine/tesco'),
	al_engine = require('../../engine/aldi');

router.get('/',
	function (req, res, next) {
		var deferred = Q.defer();

		var fns = [];
		fns.push(sv_engine.fire());
		//fns.push(ts_engine.fire());
		//fns.push(al_engine.fire());

		Q.all(fns)
		.then(function(result){
			var products = [].concat.apply([], result);
			deferred.resolve(products);
		})
		return deferred.promise;
	}
);

module.exports = router;



	