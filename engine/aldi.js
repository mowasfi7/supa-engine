var http = require('follow-redirects').http,
	cheerio = require('cheerio'),
	color = require('cli-color'),
	Q = require('q'),
	AldiProduct = require('../database').AldiProduct,
	AutoComplete = require('../database').AutoComplete;

exports.fire = function(callback){
	return apiRequest('/en/site-map')
	.then(function(result){
		return parseProductLinks(result);
	})
	.then(function(result){
		return parseNInsertProducts(result, [], Q.defer());
	})
	.then(function(result){
		var deferred = Q.defer();
		deferred.resolve(result);
		return deferred.promise;
	})
	.catch(function(error){
		console.error(error);
		var deferred = Q.defer();
		deferred.reject(error);
		return deferred.promise;
	});
};

function apiRequest(path){
	console.log(color.cyan("Got a Aldi request for: " + path));
	var deferred = Q.defer();

	var headers = {
		'Accept-Encoding': 'gzip,deflate',
		Host: 'www.aldi.ie'
	};

	var options = {
		hostname: 'www.aldi.ie',
		path: path,
		method: 'GET',
		headers: headers
	};

	var aldiReq = http.get(options, function(aldiRes){
		handleAldiResponse(aldiReq, aldiRes).then(function(result){
			deferred.resolve(result);
		});
	});

	aldiReq.on('error', function(error) {
		console.log(color.red("Feck, request error, let me try that again"));
		deferred.reject(error);
	});

	aldiReq.setTimeout(5000, function(){
		aldiReq.abort();
		console.log(color.red("Feck, didn't get a response fast enough, let me abort and try again..."));
		deferred.reject("timeout");
	});

	return deferred.promise;
}

function handleAldiResponse(aldiReq, aldiRes){
	var deferred = Q.defer();
	var responseString = '';
	aldiRes.on('data', function(data){
		responseString += data;
	});
	aldiRes.on('end', function() {
		aldiReq.abort();
		console.log(color.green("Returning Aldi response"));
		deferred.resolve(responseString);
	});
	aldiRes.on('error', function(error) {
		console.log(color.red("Feck, response error"));
		deferred.reject(error);
	});
	return deferred.promise;
}

function parseProductLinks(dump){
	var productLinks = [];
	$ = cheerio.load(dump);
	$('a').each(function(){
		if($(this).attr('href').indexOf('detail') > -1){
			productLinks.push($(this).attr('href').substring(19));
		}
	});
	return productLinks;
}

function parseNInsertProducts(links, products, deferred){
	if(links.length == 0){
		console.log(color.yellow("Attempting to insert " + products.length + " Aldi products in the DB"));
		AldiProduct.bulkCreate(products,  {updateOnDuplicate: [
			'title', 
			'images', 
			'value', 
			'per', 
			'detailamount', 
			'description',
			'limited'
		]})
		.then(function(result){
			console.log("Inserted " + result.length + " Aldi products from " + products.length);
			products.forEach(function(product, i){
				products[i] = {product: product.title}
			});
			return AutoComplete.bulkCreate(products);
		})
		.then(function(result){
			console.log("Done");
			deferred.resolve("Done");
			return deferred.promise;
		})
		.catch(function(error){
			console.error(error);
			var deferred = Q.defer();
			deferred.reject(error);
			return deferred.promise;
		});
	}
	else{
		console.log(color.yellow(links.length + " products remaining"));
		apiRequest(links[0])
		.then(function(result){
			$ = cheerio.load(result);
			var limited = links[0].match(/.*specialbuys\/(.*)\/products.*/);
			var details = {
				path: links[0].substring(4).replace(/-/g, ' ').replace(/\//g, '|').replace('product range|', '').replace('products detail page|ps|p|', ''),
				title: $('.detail-box--price-box--title').text().trim(),
				images: $('.detail-box--image').attr('src'),
				value: $('.box--value').text().trim().replace('€', '') + 
					   $('.box--decimal').text().trim(),
				per: $('.box--amount').text().trim(),
				detailamount: $('.box--detailamount').text().trim(),
				description: $('.detail-tabcontent').children().length > 0 ? $('.detail-tabcontent').html().trim().replace(/\t/g, '').replace(/\n/g, '').replace(/<h2 class="ym-print">(.*)<\/h2>/, '') : '',
				limited: limited ? limited[1] : null
			}
			if(details.value.indexOf('c') > -1){
				details.value.replace('c', '');
				details.value = parseInt(details.value) / 100;
			}
			if(details.images){
				if(details.title.length > 0) products.push(details);
				links.splice(0, 1);
			}
			else if($('.media-gallery').children('img')){
				var images = "";
				$('.media-gallery').children('img').each(function(){
					images += $(this).attr('src') + "|";
				});
				details.images = images.slice(0, -1);
				if(details.title.length > 0) products.push(details);
				links.splice(0, 1);
			}
			else{
				console.log(color.red("Incomplete details, let me try again"));	
			}
			setTimeout(function(){ parseNInsertProducts(links, products, deferred); }, 500);
			
		})
		.catch(function(error){
			console.log(color.red("Error parsing " + links[0] + ", let me try again"));
			setTimeout(function(){
				parseNInsertProducts(links, products, deferred);
			}, 1000);
		});
	}
	return deferred.promise;
}