var express = require('express');
var router = express.Router();
var helper = require('../../helper/supervalu');
var SuperValuCategory = require('../../database').SuperValuCategory;
var SuperValuProduct = require('../../database').SuperValuProduct;

router.get('/pullproducts',
	function (req, res, next) {
	    var path = '/API/2/Session.asmx/Login';
		var data = {"pwd":"HMsQmP3Wyr+mt",
					"userEmail":"sv_api@sv.ie",
					"appKey":"72c62b26-9892-456b-ae34-b4fcee776a7d"};
		helper.apiRequest(path, data, function(response, err){
			if(err) return res.status(500).send(err);
			req.sessionKey = response.SessionKey;
			next();
		});
	},
	function(req, res, next) {
		var path = '/API/2/Assortment.asmx/GetCategoryTree';
		var data = {"type":"N",
					"cacheDate":"20100101 00:01",
					"cacheStoreID":1713,
					"sessionKey": req.sessionKey};
		helper.apiRequest(path, data, function(response, err){
			if(err) return res.status(500).send(err);
			var cats = [];
			response.Categories.forEach(function(cat){
				cats.push({
					id: cat.CategoryID,
					name: cat.CategoryName,
					parent_id: cat.ParentID == 0 ? null : cat.ParentID,
					priority: cat.Priority,
					children_count: 0
				});
			});
			req.svCategories = cats;
			SuperValuCategory.bulkCreate(cats, {updateOnDuplicate: ['updated_at']}).then(function(){
				next();
			}).error(function(err){
				res.status(500).send(err);
			});
		});
	},
	function(req, res, next) {
		helper.removeParentCategories(req.svCategories, function(cats, err){
			var path = '/API/2/Assortment.asmx/GetProductListing';
			var data = {"type":"0",
						"listTo":"",
						"cachedDate":"",
						"filter":null,
						"sessionKey":req.sessionKey,
						"listFrom":""};
			helper.pullProducts(path, data, cats, [], function(response, err){
				if(err) return res.status(500).send(err);
				var products = [];
				response.forEach(function(product){
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
				SuperValuProduct.bulkCreate(products, {updateOnDuplicate: ['updated_at']}).then(function(){
					next();
				}).error(function(err){
					res.status(500).send(err);
				});
			});
		});
	},
	function(req, res, next) {
		var path = '/API/2/Session.asmx/Logout';
		var data = { "sessionKey": req.sessionKey };
		helper.apiRequest(path, data, function(response, err){
			if(err) return res.status(500).send(err);
			res.send("done");
		});
	}
);

router.get('/getparent/:id',
	function (req, res, next) {
		SuperValuCategory.findOne(req.params.id).then(function (instance){
			instance.getParent().then(function (parent){
				res.json(parent);
			});
		});
	}
);

router.get('/getchildren/:id',
	function (req, res, next) {
		SuperValuCategory.findOne(req.params.id).then(function (instance){
			instance.getChildren().then(function (children){
				res.json(children);
			});
		});
	}
);

module.exports = router;