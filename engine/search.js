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
		attributes: ['id', 'name', 'image', 'price', 'measure', 'price_desc', 'promo', 'limited'],
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
			var p = {
				s: 's',
				q: keyword,
				id: product.id,
				c: product.Category.Parent.Parent.name + "|" + product.Category.Parent.name + "|" + product.Category.name
			}
			if(product.name) p.n = product.name;
			if(product.image) p.im = product.image;
			if(product.price) p.p = product.price;
			if(product.measure) p.m = product.measure;
			if(product.price_desc) p.pd = product.price_desc;
			if(product.promo) p.pr = product.promo;
			if(product.limited) p.l = new Date(product.limited).getTime();
			products.push(p);
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
			var p = {
				s: 't',
				q: keyword,
				id: product.id,
				c: product.Category.Parent.Parent.name + "|" + product.Category.Parent.name + "|" + product.Category.name
			}
			if(product.name) p.n = product.name;
			if(product.image) p.im = product.image;
			if(product.price) p.p = product.price;
			if(product.price_desc) p.pd = product.price_desc;
			if(product.promo) p.pr = product.promo;
			products.push(p);
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
			var p = {
				s: 'a',
				q: keyword,
				id: product.id,
				c: product.category
			}
			if(product.name) p.n = product.name;
			if(product.image) p.im = product.image;
			if(product.price) p.p = product.price;
			if(product.measure) p.m = product.measure;
			if(product.price_desc) p.pd = product.price_desc;
			if(product.limited) p.l = new Date(product.limited).getTime();
			products.push(p);
		});
		deferred.resolve(products);
	});
	return deferred.promise;
}