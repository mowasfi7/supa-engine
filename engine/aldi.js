var http = require('follow-redirects').http,
	cheerio = require('cheerio'),
	color = require('cli-color'),
	Q = require('q'),
	zlib = require('zlib');

exports.fire = function(callback){
	return apiRequest('/en/site-map')
	.then(function(result){
		return parseProductLinks(result);
	})
	.then(function(result){
		return parseProducts(result.splice(0,1), [], Q.defer());
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
	if(aldiRes.headers['content-encoding'] && aldiRes.headers['content-encoding'].toLowerCase().indexOf('gzip') > -1){
		var buffer = [];
		var gunzip = zlib.createGunzip();
		aldiRes.pipe(gunzip);
		gunzip.on('data', function(data){
			buffer.push(data.toString());
		});
		gunzip.on('end', function(){
			aldiReq.abort();
			console.log(color.green("Returning unzipped Aldi response"));
			deferred.resolve(buffer.join(""));
		});
		gunzip.on('error', function(error){
			console.log(color.red("Feck, zipped response error"));
			deferred.reject(error);
		});
	}
	else{
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
	}
	return deferred.promise;
}

function parseProductLinks(dump){
	var productLinks = [];
	$ = cheerio.load(dump);
	$('a').each(function(i, elem){
		if($(this).attr('href').indexOf('detail') > -1){
			productLinks.push($(this).attr('href').substring(19));
		}
	});
	return productLinks;
}

function parseProducts(links, products, deferred){
	if(links.length == 0){
		console.log(color.green("Returning " + products.length + " products"));
		deferred.resolve(products);
	}
	else{
		console.log(color.yellow(links.length + " products remaining"));
		apiRequest(links[0])
		.then(function(result){
			$ = cheerio.load(result);
			/*  */
			var image = $('.detail-box--image').attr('src');
			var title = $('.detail-box--price-box--title').data();
			console.log(title);
			links.splice(0, 1);
			parseProducts(links, products, deferred);
		})
		.catch(function(error){
			console.log(color.red("Error parsing " + links[0] + ", let me try again"));
			setTimeout(function(){
				parseProducts(links, products, deferred);
			}, 1000);
		});
	}
	return deferred.promise;
}