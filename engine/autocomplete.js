var Q = require('q'),
	AutoComplete = require('../database').AutoComplete;

exports.fire = function(keyword){
	return lookup(keyword);
}

function lookup(keyword){
	var deferred = Q.defer();
	AutoComplete.findAll({
		attributes: ['product'],
		where: {
			product: {
				like: '%' + keyword + '%'
			}
		}
	})
	.then(function(result){
		var products = [];
		result.forEach(function(product){
			products.push(product.product);
		});
		deferred.resolve(products);
	});
	return deferred.promise;
}