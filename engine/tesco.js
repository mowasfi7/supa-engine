var http = require('follow-redirects').http,
	cheerio = require('cheerio'),
	color = require('cli-color'),
	Q = require('q'),
	zlib = require("zlib"),
	TescoCategory = require('../database').TescoCategory,
	TescoProduct = require('../database').TescoProduct;

exports.fire = function(callback){
	var list = [];
	return apiRequest('/groceries')
	.then(function(result){
		list = parseDepartments(result).splice(0, 1);
		return TescoCategory.bulkCreate(list, {updateOnDuplicate: ['name', 'parent_id', 'updated_at']});
	})
	.then(function(result){
		return politePullCategoriesNGroups(list, [], Q.defer());
	})
	.then(function(result){
		list = parseCategoriesNGroups(result);
		return TescoCategory.bulkCreate(list.categories.concat(list.groups), {updateOnDuplicate: ['name', 'parent_id', 'updated_at']});
	})
	.then(function(result){
		return politePullProductLinks(list.groups.splice(0, 50), 1, [], Q.defer());
	})
	.then(function(result){
		list = [];
		return politePullProductDetails(result, [], Q.defer());
	})
	.catch(function(error){
		console.error(error);
		// var deferred = Q.defer();
		// deferred.reject(error);
		// return deferred.promise;
	});
};

function apiRequest(path, url){
	console.log(color.cyan("Got a Tesco request for: " + path));
	var deferred = Q.defer();

	var headers = {
		'Accept-Encoding': 'gzip,deflate',
		Host: 'www.tesco.ie'
	};

	var options = {
		//host: '122.89.128.122',
		//host: 'localhost',
		//port: 7474,
		//path: 'http://www.tesco.ie/' + path,
		hostname: 'www.tesco.ie',
		path: path,
		method: url ? 'POST' : 'GET',
		headers: headers
	};

	var tescoReq;

	if(url){
		var data = '<request referrerUrl="http://www.tesco.ie/groceries/"><navigationPosition selectedUrl=" ' + url.replace('&', '&amp;') + '" flyoutLevel="3"/></request>';
		tescoReq = http.request(options, function(tescoRes){
			handleTescoResponse(tescoReq, tescoRes).then(function(result){
				deferred.resolve(result);
			});
		});
		tescoReq.write(data);
		tescoReq.end();
	}
	else tescoReq = http.get(options, function(tescoRes){
		handleTescoResponse(tescoReq, tescoRes).then(function(result){
			deferred.resolve(result);
		});
	});

	tescoReq.on('error', function(error) {
		console.log(color.red("Feck, request error, let me try that again"));
		deferred.reject(error);
	});

	tescoReq.setTimeout(5000, function(){
		tescoReq.abort();
		console.log(color.red("Feck, didn't get a response fast enough, let me abort and try again..."));
		deferred.reject("timeout");
	});

	return deferred.promise;
}

function handleTescoResponse(tescoReq, tescoRes){
	var deferred = Q.defer();
	if(tescoRes.headers['content-encoding'] && tescoRes.headers['content-encoding'].toLowerCase().indexOf('gzip') > -1){
		var buffer = [];
		var gunzip = zlib.createGunzip();
		tescoRes.pipe(gunzip);
		gunzip.on('data', function(data){
			buffer.push(data.toString());
		});
		gunzip.on('end', function(){
			tescoReq.abort();
			console.log(color.green("Returning unzipped Tesco response"));
			deferred.resolve(buffer.join(""));
		});
		gunzip.on('error', function(error){
			console.log(color.red("Feck, zipped response error"));
			deferred.reject(error);
		});
	}
	else{
		var responseString = '';
		tescoRes.on('data', function(data){
			responseString += data;
		});
		tescoRes.on('end', function() {
			tescoReq.abort();
			console.log(color.green("Returning Tesco response"));
			deferred.resolve(responseString);
		});
		tescoRes.on('error', function(error) {
			console.log(color.red("Feck, response error"));
			deferred.reject(error);
		});
	}
	return deferred.promise;
}

function parseDetails(parent, dump){ //create category objects
	var idRegex = /N=(.*)&/;
	var a = dump.children[0];
	var category = {};
	category.id = idRegex.exec(a.attribs.href)[1];
	category.name = a.children[0].data;
	category.parent_id = parent ? parent.id : null;
	category.location = a.attribs.href.substring(a.attribs.href.indexOf('www.tesco.ie') + 12);
	return category;
}

function parseDepartments(dump){ //pulls raw departments and return category objects
	var categories = [];
	$ = cheerio.load(dump);
	var child = $('#secondaryNav').children('ul')[0].children[0];
	while(child){
		if(child.name == "li") categories.push(parseDetails(null, child));  //create category objects
		child = child.next;
	}
	return categories;
}

function parseCategoriesNGroups(catGroupDumps){
	var categories = [];
	var groups = [];
	catGroupDumps.forEach(function(catDump){
		var columns = catDump.dump;
		var i = 0;
		var parentDump;
		while(true){
			var column = columns[(i++).toString()];
			if(column){
				var child = column.children[0].children[0];
				while(child){
					if(child.children[0].name == "h3"){
						parentDump = parseDetails(catDump.cat, child.children[0])
						categories.push(parentDump);
					}
					else if(child.name == "li"){
						groups.push(parseDetails(parentDump, child));
					}
					child = child.next;
					if(!child.name) break;
				}
			}
			else break;
		}
	});
	return {categories: categories, groups: groups};
}

function politePullCategoriesNGroups(depts, groupsDumps, deferred){
	if(depts.length == 0){
		console.log(color.green("Returning " + groupsDumps.length + " category and group dumps"));
		deferred.resolve(groupsDumps);
	}
	else{
		console.log(color.yellow(depts.length + " departments remaining"));
		apiRequest('/groceries/Ajax/GetNavigationFlyout.aspx', depts[0].location)
		.then(function(result){
			$ = cheerio.load(result);
			groupsDumps.push({cat: depts[0], dump: $('.column')});
			depts.splice(0, 1);
			politePullCategoriesNGroups(depts, groupsDumps, deferred);
		})
		.catch(function(error){
			setTimeout(function(){
				politePullCategoriesNGroups(depts, groupsDumps, deferred);
			}, 1000);
		});
	}
	return deferred.promise;
}

function politePullProductLinks(groups, page, prodLinks, deferred){
	if(groups.length == 0){
		console.log(color.green("Returning " + prodLinks.length + " product links"));
		deferred.resolve(prodLinks);
	}
	else{
		console.log(color.yellow(groups.length + " categories remaining "));
		apiRequest(groups[0].location + "&Nao=" + (page - 1) * 20)
		.then(function(result){
			$ = cheerio.load(result);
			var linkCount = 0;
			$('#endFacets-1').children('ul')[0].children.forEach(function(child){
				linkCount++;
				prodLinks.push({groupID: groups[0].id, link: child.children[0].children[0].children[0].attribs.href});
			});
			
			console.log(color.yellow(groups[0].name + " page " +  page + " (" + (page * 20 - 19) + "-" + ((page - 1) * 20 + linkCount) + ") of " + $('.pageTotalItemCount')[0].children[0].data));

			if(parseInt($('.pageTotalItemCount')[0].children[0].data) > page * 20){
				politePullProductLinks(groups, ++page, prodLinks, deferred);
			}
			else{
				groups.splice(0, 1);
				politePullProductLinks(groups, 1, prodLinks, deferred);
			}
		})
		.catch(function(error){
			setTimeout(function(){
				politePullProductLinks(groups, page, prodLinks, deferred);
			}, 1000);
		});
	}
	return deferred.promise;
}

function politePullProductDetails(prodLinks, productDumps, deferred){
	if(prodLinks.length == 0){
		console.log(color.green("Returning " + productDumps.length + " product dumps"));
		deferred.resolve(productDumps);
	}
	else{
		console.log(color.yellow(prodLinks.length + " products remaining "));
		apiRequest(prodLinks[0].link)
		.then(function(result){
			prodLinks[0].dump = result;
			productDumps.push(prodLinks[0]);
			prodLinks.splice(0, 1);
			if(productDumps.length == 1000 || prodLinks.length == 0){
				parseNInsertProducts(productDumps, [], Q.defer())
				.then(function(result){
					if(prodLinks.length > 0) politePullProductDetails(prodLinks, [], deferred);
					else deferred.resolve(productDumps);
				});
			}
			else{
				politePullProductDetails(prodLinks, productDumps, deferred);
			}
		})
		.catch(function(error){
			setTimeout(function(){
				politePullProductDetails(prodLinks, productDumps, deferred);
			}, 1000);
		});
	}
	return deferred.promise;
}

function parseNInsertProducts(productDumps, products, deferred){
	if(productDumps.length == 0){
		TescoProduct.bulkCreate(products,  {updateOnDuplicate: [
			'name', 
			'cat_id', 
			'images', 
			'price', 
			'price_desc', 
			'details_html', 
			'promo_html', 
			'updated_at'
		]})
		.then(function(result){
			console.log("Inserted " + result.length + " products from " + products.length);
			deferred.resolve("Done");
		});
	}
	else{
		var productDump = productDumps[0];
		var product = {};
		var idRegex = /id=(.*)/;
		product.id = idRegex.exec(productDump.link)[1];
		product.cat_id = productDump.groupID;

		try{
			$ = cheerio.load(productDump.dump);
			product.name = $('.productDetails').get(0).children[0].children[0].data.trim();
			product.price = $('.linePrice').get(0).children[0].data.trim().replace(/[^\d.-]/g, ''); //removes non-numeric values excluding the dot
			product.price_desc = $('.linePriceAbbr').get(0).children[0].data.trim();
			product.promo_html = $('.promoBox').html().trim();
			product.details_html = $('.productDetailsContainer').last().html().trim();

			if($('.imageColumn').children('ul').get(0)){
				var imagesDump = "";
				$('.imageColumn').children('ul').get(0).children.forEach(function(li){
					imagesDump += li.children[0].attribs.src + "||";
				});
				product.images = imagesDump.slice(0, -2);
			}
			else if ($('.imageColumn').children('p').get(0)){
				product.images = $('.imageColumn').children('p').get(0).children[0].attribs.src;
			}

			products.push(product);
		}
		catch(error){
			console.log(product.id);
			console.log(productDump.dump);
			console.log(color.red("Couldn't read data, skipping..."));
		}

		productDumps.splice(0, 1);
		parseNInsertProducts(productDumps, products, deferred);
	}
	return deferred.promise;
}