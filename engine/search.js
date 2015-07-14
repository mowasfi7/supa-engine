var http = require('http'),
	color = require('cli-color'),
	Q = require('q'),
	SuperValuCategory = require('../database').SuperValuCategory,
	SuperValuProduct = require('../database').SuperValuProduct,
	TescoCategory = require('../database').TescoCategory,
	TescoProduct = require('../database').TescoProduct;

exports.fire = function(keyword){
	var deferred = Q.defer();
	var keywords = keyword.split('|');

	var fns = [];

	keywords.forEach(function(kw){
		fns.push(searchSupervalu(kw));
		fns.push(searchTesco(kw));
	})

	console.log(color.cyan("Searching for " + keywords));

	Q.all(fns)
	.then(function(result){
		var products = [].concat.apply([], result);
		console.log(color.green("Returning " + products.length + " results"));
		deferred.resolve(products);
	})
	return deferred.promise;
}

function searchSupervalu(keyword){
	var deferred = Q.defer();
	SuperValuProduct.findAll({
		attributes: ['id', 'name', 'unit_price', 'price_desc', 'small_image'],
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
				price: product.unit_price,
				price_desc: product.price_desc,
				image: product.small_image == null ? null : 'http://shop.supervalu.ie/shopping/images/products/small/' + product.small_image,
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
		attributes: ['id', 'name', 'price', 'price_desc', 'images'],
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
				price: product.price,
				price_desc: product.price_desc,
				image: product.images.split('|')[0],
				category: product.Category.Parent.Parent.name + "|" + product.Category.Parent.name + "|" + product.Category.name
			});
		});
		deferred.resolve(products);
	});
	return deferred.promise;
}