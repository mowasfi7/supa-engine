var http = require('http'),
	color = require('cli-color'),
	Q = require('q'),
	SuperValuCategory = require('../database').SuperValuCategory,
	SuperValuProduct = require('../database').SuperValuProduct;


exports.fire = function(){
	var sessionKey;

	return login()
	.then(function(result){
		sessionKey = result;
		return pullNInsertCategories(sessionKey);
	})
	.then(function(result){
		return pullNInsertProducts(sessionKey, result.splice(0, 100), [], Q.defer());
	})
	.then(function(result){
		return logout(sessionKey);
	})
	.catch(function(error){
		console.error(error);
		var deferred = Q.defer();
		deferred.reject(error);
		return deferred.promise;
	});
}

function apiRequest(path, data){
	console.log(color.cyan('Got a SuperValue request for: ' + path));
	var deferred = Q.defer();
	var dataString = JSON.stringify(data);
	var headers = {
		'Content-Type': 'application/json',
		'Accept-Encoding': 'gzip,deflate',
		'Content-Length': dataString.length
	};
	var options = {
		hostname: 'www.shop.supervalu.ie',
		path: path,
		method: 'POST',
		headers: headers
	};
	var svReq = http.request(options, function(svRes) {
		var responseString = '';

		svRes.on('data', function(data) {
			responseString += data;
		});

		svRes.on('end', function() {
			try{
				response = JSON.parse(responseString);
				if(response.d){
					if(response.d.ResponseCode == 0){
						console.log(color.green('Returning SuperValu response for: ' + path));
						deferred.resolve(response.d);
					}
					else deferred.reject(response.d.ResponseInfo);
				}
				else deferred.reject('response.d not found');
			}
			catch(err){
				console.log(responseString);
				deferred.reject('not a JSON response');
			};
		});
	});

	svReq.on('error', function(error) {
		deferred.reject('Feck, request error...');
	});

	svReq.setTimeout(5000, function(){
		svReq.abort();
		deferred.reject('Feck, didnt get a response fast enough...');
	});

	svReq.write(dataString);
	svReq.end();
	return deferred.promise;
}

function login(){
	var deferred = Q.defer();
	apiRequest('/API/2/Session.asmx/Login',
				{'pwd' : 'HMsQmP3Wyr+mt',
				'userEmail' : 'sv_api@sv.ie',
				'appKey' : '72c62b26-9892-456b-ae34-b4fcee776a7d'})
	.then(function(result){
		deferred.resolve(result.SessionKey);
	})
	.catch(function(error){
		console.log(color.red(error));
		console.log('Trying again...');
		return login();
	});
	return deferred.promise;
}

function pullNInsertCategories(sessionKey){
	var deferred = Q.defer();
	apiRequest('/API/2/Assortment.asmx/GetCategoryTree',
				{'type':'N',
				'cacheDate':'20100101 00:01',
				'cacheStoreID':1713,
				'sessionKey':sessionKey})
	.then(function(result){
		var categories = [];
		result.Categories.forEach(function(cat){
			categories.push({
				id: cat.CategoryID,
				name: cat.CategoryName,
				parent_id: cat.ParentID == 0 ? null : cat.ParentID,
				priority: cat.Priority
			});
		});
		SuperValuCategory.bulkCreate(categories, {updateOnDuplicate: ['name', 'parent_id', 'updated_at']})
		.then(function(result){
			categories.forEach(function(cat){
				for(var i = 0; i < categories.length; i++){
					if(cat.parent_id == categories[i].id){
						categories[i].children_count++;
						break;
					}
				}
			});
			var leafCats = [];
			categories.forEach(function(cat){
				if(cat.children_count == 0){
					leafCats.push(cat);
				}
			});
			deferred.resolve(leafCats);
		});
	})
	.catch(function(error){
		console.log(color.red(error));
		console.log('Trying again...');
		return pullNInsertCategories(sessionKey);
	});
	return deferred.promise;
}

function pullNInsertProducts(sessionKey, cats, rawProducts, deferred){
	if(cats.length > 0){
		console.log(color.yellow(cats.length + ' remaining '));
		apiRequest('/API/2/Assortment.asmx/GetProductListing',
					{'type':'0',
					'listTo':'',
					'cachedDate':'',
					'filter':cats[0].id,
					'sessionKey':sessionKey,
					'listFrom':''})
		.then(function(result){
			result.Products.forEach(function(product){
				product.cat_id = cats[0].id;
				rawProducts.push(product);
			});
			cats.splice(0, 1);
			pullNInsertProducts(sessionKey, cats, rawProducts, deferred);
		})
		.catch(function(error){
			console.log(color.red(error));
			console.log('Trying again...');
			pullNInsertProducts(sessionKey, cats, rawProducts, deferred);
		});
	}
	else{
		var parsedProducts = [];
		rawProducts.forEach(function(product){
			parsedProducts.push({
				id: product.ProductID,
				name: product.ProductName,
				cat_id: product.cat_id,
				small_image: product.SmlImg,
				med_image: product.MedImg,
				lrg_image: product.LrgImg,
				unit_price: product.UnitPrice,
				unit_measure: product.UnitOfMeasure,
				price_desc: product.PriceDesc,
				promo_text: product.PromotionBulletText,
				promo_desc: product.PromoDesc,
				promo_id: product.PromotionID,
				promo_count: product.PromotionCountProducts,
				promo_grp_id: product.PromotionGroupID,
				promo_grp_name: product.PromotionGroupName,
			});
		});
		SuperValuProduct.bulkCreate(parsedProducts, {updateOnDuplicate: [
			'name', 
			'cat_id', 
			'small_image', 
			'med_image', 
			'lrg_image', 
			'unit_price', 
			'unit_measure', 
			'price_desc', 
			'promo_text', 
			'promo_desc', 
			'promo_id', 
			'promo_count', 
			'promo_grp_id', 
			'promo_grp_name', 
			'updated_at'
		]})
		.then(function(result){
			console.log('Inserted ' + result.length + ' products');
			deferred.resolve('Done');
		});
	}
	return deferred.promise;
}

function logout(sessionKey){
	var deferred = Q.defer();

	apiRequest('/API/2/Session.asmx/Logout', { 'sessionKey': sessionKey })
	.then(function(result){
		deferred.resolve('logged out');
	})
	.catch(function(error){
		console.log(color.red(error));
		console.log('Trying again...');
		return logout(sessionKey);
	});

	return deferred.promise;
}