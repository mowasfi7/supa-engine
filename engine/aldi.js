var http = require('follow-redirects').http,
	cheerio = require('cheerio'),
	color = require('cli-color'),
	Q = require('q'),
	dateFormat = require('dateformat'),
	toTitleCase = require('to-title-case'),
	AldiProduct = require('../database').AldiProduct;

exports.fire = function(){
	return apiRequest('/en/site-map')
	.then(function(result){
		return parseProductLinks(result);
	})
	.then(function(result){
		return parseNInsertProducts(result.splice(0,10), [], Q.defer());
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
	console.log(color.cyan("Got an Aldi request for: " + path));
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
		AldiProduct.bulkCreate(products, {updateOnDuplicate: ['category', 'name', 'image', 'price', 'measure', 'price_desc', 'limited', 'updated_at']})
		.then(function(result){
			console.log("Aldi - Inserted " + result.length + " products");
			deferred.resolve("Aldi - Done");
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

			if($('#c94').children('h1').text() == "Unfortunately the requested page could not be found"){
				console.log(color.red("Missing details, ignoring..."));
				links.splice(0, 1);
				setTimeout(function(){ parseNInsertProducts(links, products, deferred); }, 500);
				return false;
			}
			
			var title = $('.detail-box--price-box--title').text().trim();
			if(title.length == 0){
				console.log(color.red("Incomplete details, let me try again"));
				setTimeout(function(){ parseNInsertProducts(links, products, deferred); }, 500);
				return false;
			}

			var images;
			if($('.detail-box--image').attr('src')){
				images = $('.detail-box--image').attr('src').replace('https://www.aldi.ie/typo3temp/pics/', '');
			}
			else if($('.media-gallery').children('img')){
				images = "";
				$('.media-gallery').children('img').each(function(){
					images += $(this).attr('src').replace('https://www.aldi.ie/typo3temp/pics/', '') + "|";
				});
				images = images.slice(0, -1);
			}
			else{
				console.log(color.red("Incomplete details, let me try again"));
				setTimeout(function(){ parseNInsertProducts(links, products, deferred); }, 500);
				return false;
			}

			var parents = links[0].substring(4).slice(0, -1)
					  .replace(/-/g, ' ')
					  .replace(/\//g, '|')
					  .replace('product range|', '')
					  .replace('products detail page|ps|p|', '')
					  .replace('about aldi|', '');
			parents = parents.substring(0, parents.lastIndexOf('|'));
			if(parents.indexOf('specialbuys') > -1){
				parents = parents.split('|')[0];
			}
			
			var value = $('.box--value').text().trim().replace('€', '') + $('.box--decimal').text().trim();
			if(value.indexOf('c') > -1){
				value.replace('c', '');
				value = parseInt(value) / 100;
			}
			else{
				value = parseFloat(value);
			}
			
			var per = $('.box--amount').text().trim();
			
			var detailamount = $('.box--detailamount').text().trim();
			
			//var description = $('.detail-tabcontent').children().length == 0 ? null : 
			//				  utils($('.detail-tabcontent').html(), /<h2 class="ym-print">(.*)<\/h2>/);
			
			var limited = links[0].match(/.*specialbuys\/(.*)\/products.*/);
			if(limited){
				limited = dateFormat(new Date(limited[1].replace(/^\w+-/, '')), 'd-m');
			}

			products.push({
				url: links[0],
				category: parents,
				name: toTitleCase(title),
				image: images.length > 0 ? images : null,
				price: value > 0 ? value : null,
				measure: per.length > 0 ? per: null,
				price_desc: detailamount.length > 0 ? detailamount : null,
				//description: description.length > 0 ? description : null,
				limited: limited
			});

			links.splice(0, 1);
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