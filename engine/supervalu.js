var http = require('http');
var color = require('cli-color');
var Q = require('q');
var SuperValuCategory = require('../database').SuperValuCategory;
var SuperValuProduct = require('../database').SuperValuProduct;


exports.fire = function(){
	var path = '/API/2/Session.asmx/Loginx';
	var data = {"pwd":"HMsQmP3Wyr+mt",
				"userEmail":"sv_api@sv.ie",
				"appKey":""};

	var sessionKey;
	var categories;

	return apiRequest(path, data)
	.then(function(result){
		sessionKey = result.SessionKey;
		path = '/API/2/Assortment.asmx/GetCategoryTree';
		data = {"type":"N",
				"cacheDate":"20100101 00:01",
				"cacheStoreID":1713,
				"sessionKey":sessionKey};
		return apiRequest(path, data);
	})
	.then(function(result){
		var cats = [];
		result.Categories.forEach(function(cat){
			cats.push({
				id: cat.CategoryID,
				name: cat.CategoryName,
				parent_id: cat.ParentID == 0 ? null : cat.ParentID,
				priority: cat.Priority,
				children_count: 0
			});
		});
		categories = cats;
		return SuperValuCategory.bulkCreate(categories, {updateOnDuplicate: ['updated_at']});
	})
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
		categories = leafCats;
		var path = '/API/2/Assortment.asmx/GetProductListing';
		var data = {"type":"0",
					"listTo":"",
					"cachedDate":"",
					"filter":null,
					"sessionKey":sessionKey,
					"listFrom":""};
		return pullProducts(path, data, categories.slice(0, 2), [], Q.defer());
	})
	.then(function(result){
		var products = [];
		result.forEach(function(product){
			products.push({
				id: product.ProductID,
				name: product.ProductName,
				cat_id: product.cat_id,
				small_image: product.SmlImg,
				med_image: product.MedImg,
				lrg_image: product.LrgImg,
				type: product.ProductType,
				unit_price: product.UnitPrice,
				unit_measure: product.UnitOfMeasure,
				price_desc: product.PriceDesc,
				qty: product.Qty,
				note: product.Note,
				favourite: product.Favorite,
				promo_text: product.PromotionBulletText,
				promo_desc: product.PromoDesc,
				promo_id: product.PromotionID,
				promo_count: product.PromotionCountProducts,
				promo_grp_id: product.PromotionGroupID,
				promo_grp_name: product.PromotionGroupName,
				promo_start: product.PromotionStartDate,
				promo_end: product.PromotionEndDate
			});
		});
		return SuperValuProduct.bulkCreate(products, {updateOnDuplicate: ['updated_at']})
	})
	.then(function(result){
		var path = '/API/2/Session.asmx/Logout';
		var data = { "sessionKey": sessionKey };
		return apiRequest(path, data);
	})
	.catch(function(error){
		return error;
	});
}

function apiRequest(path, data){
	console.log(color.cyan("Got a SV request for: " + path));
	var deferred = Q.defer();
	var dataString = JSON.stringify(data);
	var headers = {
		'Content-Type': 'application/json',
		'Accept-Encoding': 'gzip',
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
						console.log(color.green("Returning SV response for: " + path));
						deferred.resolve(response.d);
					}
					else deferred.reject(response.d.ResponseInfo);
				}
				else deferred.reject("response.d not found");
			}
			catch(err){
				deferred.reject("not a JSON response");
			};
		});
	});

	svReq.on('error', function(err) {
		callback(null, err);
	});

	svReq.write(dataString);
	svReq.end();
	return deferred.promise;
}

function pullProducts(path, data, cats, products, deferred){
	if(cats.length == 0){
		console.log("Returning " + products.length + " products");
		deferred.resolve(products);
	}
	else{
		console.log(color.yellow(cats.length + " remaining "));
		data.filter = cats[0].id;
		apiRequest(path, data)
		.then(function(result){
			result.Products.forEach(function(product){
				product.cat_id = cats[0].id;
				products.push(product);
			});
			cats.splice(0, 1);
			setTimeout(function(){
				pullProducts(path, data, cats, products, deferred);
			}, 1000);
		})
		.catch(function(error){
			console.log("Error: " + error);
			deferred.reject(error);
		});
	}
	return deferred.promise;
}