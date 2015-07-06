var http = require('follow-redirects').http,
	cheerio = require('cheerio'),
	color = require('cli-color'),
	Q = require('q'),
	zlib = require("zlib"),
	TescoCategory = require('../database').TescoCategory;

exports.fire = function(callback){
	var list = [];
	return apiRequest('/groceries')
	.then(function(result){
		list = parseDepartments(result);
		return TescoCategory.bulkCreate(list, {updateOnDuplicate: ['updated_at']});
	})
	.then(function(result){
		return politePullCategoriesNGroups(list.splice(0, 10), [], Q.defer());
	})
	.then(function(result){
		list = parseCategoriesNGroups(result);
		return TescoCategory.bulkCreate(list.categories.concat(list.groups), {updateOnDuplicate: ['updated_at']});
	})
	.then(function(result){
		return politePullProductLinks(list.groups.splice(0, 10), 1, [], Q.defer());
	})
	.then(function(result){
		return politePullProductDetails(result, [], Q.defer());
	})
	.then(function(result){
		list = parseProducts(result);
		//console.log(list);
	})
	.catch(function(error){
		console.error(error);
		var deferred = Q.defer();
		deferred.reject(error);
		return deferred.promise;
	});
};

function apiRequest(path){
	console.log(color.cyan("Got a Tesco request for: " + path));
	var deferred = Q.defer();

	var headers = { 'Accept-Encoding': 'gzip,deflate' };
	var options = {
		hostname: 'www.tesco.ie',
		path: path,
		method: 'GET',
		headers: headers
	};

	http.get(options, function(tescoRes) {
		if(tescoRes.headers['content-encoding'] && tescoRes.headers['content-encoding'].toLowerCase().indexOf('gzip') > -1){
			var buffer = [];
			var gunzip = zlib.createGunzip();
        	tescoRes.pipe(gunzip);
        	gunzip.on('data', function(data){
				buffer.push(data.toString());
			});
			gunzip.on('end', function() {
				console.log(color.green("Returning unzipped Tesco response for: " + path));
				deferred.resolve(buffer.join(""));
			});
			gunzip.on('error', function(error) {
				deferred.reject(error);
			});
		}
		else{
			var responseString = '';
			tescoRes.on('data', function(data){
				responseString += data;
			});
			tescoRes.on('end', function() {
				console.log(color.green("Returning Tesco response for: " + path));
				deferred.resolve(responseString);
			});
			tescoRes.on('error', function(error) {
				deferred.reject(error);
			});
		}
	});
	return deferred.promise;
}

function apiPullCategoriesNGroups(url){
	console.log(color.cyan("Got a Tesco request for: " + url));
	var deferred = Q.defer();
	var data = '<request referrerUrl="http://www.tesco.ie/groceries/"><navigationPosition selectedUrl=" ' + url.replace('&', '&amp;') + '" flyoutLevel="3"/></request>';
	var headers = {
		'Accept-Encoding': 'gzip,deflate',
		'Content-Type': 'application/xml',
		'Content-Length': data.length
	};
	var options = {
		hostname: 'www.tesco.ie',
		path: '/groceries/Ajax/GetNavigationFlyout.aspx',
		method: 'POST',
		headers: headers
	};

	var svReq = http.request(options, function(tescoRes) {
		var buffer = [];
		var gunzip = zlib.createGunzip();
		tescoRes.pipe(gunzip);
		gunzip.on('data', function(data){
			buffer.push(data.toString());
		});
		gunzip.on('end', function() {
			console.log(color.green("Returning unzipped Tesco response for: " + url));
			deferred.resolve(buffer.join(""));
		});
		gunzip.on('error', function(error) {
			deferred.reject(error);
		});
	});

	svReq.write(data);
	svReq.end();
	return deferred.promise;
}

function parseDetails(parent, dump){ //create category objects
	var idRegex = /N=(.*)&/;
	var a = dump.children[0];
	var category = {};
	category.id = parseInt(idRegex.exec(a.attribs.href)[1]);
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

function politePullCategoriesNGroups(depts, groupsDumps, deferred){
	if(depts.length == 0){
		console.log("Returning " + groupsDumps.length + " category and group dumps");
		deferred.resolve(groupsDumps);
	}
	else{
		console.log(color.yellow(depts.length + " remaining"));
		apiPullCategoriesNGroups(depts[0].location)
		.then(function(result){
			$ = cheerio.load(result);
			groupsDumps.push({cat: depts[0], dump: $('.column')});
			depts.splice(0, 1);
			politePullCategoriesNGroups(depts, groupsDumps, deferred);
		})
		.catch(function(error){
			console.log("Error: " + error);
			deferred.reject(error);
		});
	}
	return deferred.promise;
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

function politePullProductLinks(groups, page, prodLinks, deferred){
	if(groups.length == 0){
		console.log("Returning product links");
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
			console.log("Error: " + error);
			deferred.reject(error);
		});
	}
	return deferred.promise;
}

function politePullProductDetails(prodLinks, productDumps, deferred){
	if(prodLinks.length == 0){
		console.log("Returning " + productDumps.length + " product dumps");
		deferred.resolve(productDumps);
	}
	else{
		console.log(color.yellow(prodLinks.length + " products remaining "));
		apiRequest(prodLinks[0].link)
		.then(function(result){
			$ = cheerio.load(result);
			prodLinks[0].dump = $('#contentMain');
			productDumps.push(prodLinks[0]);
			prodLinks.splice(0, 1);
			politePullProductDetails(prodLinks, productDumps, deferred);
		})
		.catch(function(error){
			console.log("Error: " + error);
			deferred.reject(error);
		});
	}
	return deferred.promise;
}

function parseProducts(productDumps){
	productDumps.forEach(function(productDump){
		console.log(productDump.dump.children('.productDetailsContainer')['0'].children[1].children[0].children[0].data);
	});
}