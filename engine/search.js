var Q = require('q'),
	SuperValuCategory = require('../database').SuperValuCategory,
	SuperValuProduct = require('../database').SuperValuProduct,
	TescoCategory = require('../database').TescoCategory,
	TescoProduct = require('../database').TescoProduct,
	AldiProduct = require('../database').AldiProduct;

exports.fire = function(req){
	var deferred = Q.defer();
	var keywords = req.keyword.split('|');

	var fns = [];

	keywords.forEach(function(kw){
		fns.push(searchSupervalu(kw, req.page, req.count/3));
		fns.push(searchTesco(kw, req.page, req.count/3));
		fns.push(searchAldi(kw, req.page, req.count/3));
	})

	Q.all(fns)
	.then(function(result){
		var products = [].concat.apply([], result);
		deferred.resolve(products);
	})
	return deferred.promise;
}

function searchSupervalu(keyword, page, count){
	var deferred = Q.defer();
	SuperValuProduct.findAll({
		attributes: ['id', 'name', 'image', 'price', 'measure', 'price_desc', 'promo'],
		limit: count,
		offset: (page - 1) * count,
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
				s: 'S',
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
			products.push(p);
		});
		deferred.resolve(products);
	});
	return deferred.promise;
}

function searchTesco(keyword, page, count){
	var deferred = Q.defer();
	TescoProduct.findAll({
		attributes: ['id', 'name', 'image', 'price', 'price_desc', 'promo'],
		limit: count,
		offset: (page - 1) * count,
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
				s: 'T',
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

function searchAldi(keyword, page, count){
	var deferred = Q.defer();
	AldiProduct.findAll({
		attributes: ['id', 'name', 'image', 'price', 'measure', 'price_desc', 'limited', 'category'],
		limit: count,
		offset: (page - 1) * count,
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
				s: 'A',
				q: keyword,
				id: product.id,
				c: product.category
			}
			if(product.name) p.n = product.name;
			if(product.image) p.im = product.image;
			if(product.price) p.p = product.price;
			if(product.measure) p.m = product.measure;
			if(product.price_desc) p.pd = product.price_desc;
			if(product.limited) p.l = product.limited;
			products.push(p);
		});
		deferred.resolve(products);
	});
	return deferred.promise;
}