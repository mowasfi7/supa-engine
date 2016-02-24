var Q = require('q'),
	SuperValuCategory = require('../database').SuperValuCategory,
	SuperValuProduct = require('../database').SuperValuProduct,
	TescoCategory = require('../database').TescoCategory,
	TescoProduct = require('../database').TescoProduct,
	AldiProduct = require('../database').AldiProduct;

exports.fire = function(keyword){
	var deferred = Q.defer();
	var keywords = keyword.split('|');

	var fns = [];

	keywords.forEach(function(kw){
		fns.push(searchSupervalu(kw));
		fns.push(searchTesco(kw));
		fns.push(searchAldi(kw));
	})

	Q.all(fns)
	.then(function(result){
		var products = [].concat.apply([], result);
		deferred.resolve(products);
	})
	return deferred.promise;
}

function searchSupervalu(keyword){
	var deferred = Q.defer();
	SuperValuProduct.findAll({
		attributes: ['id', 'name', 'image', 'price', 'measure', 'price_desc', 'promo'],
		where: {
			name: {
				like: '%' + keyword + '%'
			}
		},
		include: {
			model: SuperValuCategory,
			as: 'Category',
			attributes: ['name'],
			include: {
				model: SuperValuCategory,
				as: 'Parent',
				attributes: ['name'],
				include: {
					model: SuperValuCategory,
					as: 'Parent',
					attributes: ['name']
				}
			}
		}
	})
	.then(function(result){
		var products = [];
		result.forEach(function(product){
			products.push({
				store: 'Supervalu',
				keyword: keyword,
				id: product.id,
				name: product.name,
				image: product.image,
				price: product.price,
				measure: product.measure,
				price_desc: product.price_desc,
				promo: product.promo,
				category: product.Category.Parent.Parent.name + "|" + product.Category.Parent.name + "|" + product.Category.name
			});
		});
		deferred.resolve(products);
	});

	return deferred.promise;
}

function searchTesco(keyword){
	var deferred = Q.defer();
	TescoProduct.findAll({
		attributes: ['id', 'name', 'image', 'price', 'price_desc', 'promo'],
		where: {
			name: {
				like: '%' + keyword + '%'
			}
		},
		include: {
			model: TescoCategory,
			as: 'Category',
			attributes: ['name'],
			include: {
				model: TescoCategory,
				as: 'Parent',
				attributes: ['name'],
				include: {
					model: TescoCategory,
					as: 'Parent',
					attributes: ['name']
				}
			}
		}
	})
	.then(function(result){
		var products = [];
		result.forEach(function(product){
			products.push({
				store: 'Tesco',
				keyword: keyword,
				id: product.id,
				name: product.name,
				image: product.image,
				price: product.price,
				price_desc: product.price_desc,
				promo: product.promo,
				category: product.Category.Parent.Parent.name + "|" + product.Category.Parent.name + "|" + product.Category.name
			});
		});
		deferred.resolve(products);
	});
	return deferred.promise;
}

function searchAldi(keyword){
	var deferred = Q.defer();

	AldiProduct.findAll({
		attributes: ['id', 'name', 'image', 'price', 'measure', 'price_desc', 'limited', 'category'],
		where: {
			$or: {
				category: { like: '%' + keyword + '%' },
				name: { like: '%' + keyword + '%' }
			}
		}
	})
	.then(function(result){
		var products = [];
		result.forEach(function(product){
			products.push({
				store: 'Aldi',
				keyword: keyword,
				id: product.id,
				name: product.name,
				image: product.image,
				price: product.price,
				measure: product.measure,
				price_desc: product.price_desc,
				limited: product.limited,
				category: product.category
			});
		});
		deferred.resolve(products);
	});
	return deferred.promise;
}