var http = require('http');
var color = require('cli-color');

var apiRequest = function(path, data, callback){
	console.log(color.cyan("Got a SV request for: " + path));
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
						callback(response.d);
					}
					else callback(null, response.d.ResponseInfo);
				}
				else callback(null, "response.d not found");
			}
			catch(err){
				callback(null, "not a JSON response");
			};
		});
	});

	svReq.on('error', function(err) {
		callback(null, err);
	});

	svReq.write(dataString);
	svReq.end();
};

var pullProducts = function(path, data, cats, products, callback){
	if(cats.length == 0) callback(products);
	else{
		console.log(color.yellow(cats.length + " remaining "));
		data.filter = cats[0].id;
		apiRequest(path, data, function(response, err){
			if(err) callback(null, err);
			response.Products.forEach(function(product){
				product.cat_id = cats[0].id;
				products.push(product);
			});
			cats.splice(0, 1);
			setTimeout(function(){
				pullProducts(path, data, cats, products, callback);
			}, 1000);
		});
	}
};

var removeParentCategories = function(cats, callback){
	cats.forEach(function(cat){
		for(var i = 0; i < cats.length; i++){
			if(cat.parent_id == cats[i].id){
				cats[i].children_count++;
				break;
			}
		}
	});
	var leafCats = [];
	cats.forEach(function(cat){
		if(cat.children_count == 0){
			leafCats.push(cat);
		}
	});
	callback(leafCats);
};

exports.apiRequest = apiRequest;
exports.pullProducts = pullProducts;
exports.removeParentCategories = removeParentCategories;