var http = require('follow-redirects').http,
	cheerio = require('cheerio'),
	color = require('cli-color'),
	Q = require('q'),
	zlib = require("zlib"),
	TescoCategory = require('../database').TescoCategory;

exports.fire = function(callback){
	var categories = [];
	return apiRequest('/groceries')
	.then(function(result){
		var deferred = Q.defer();
		$ = cheerio.load(result);
		var child = $('#secondaryNav').children('ul')[0].children[0];
		while(child){
			if(child.name == "li") categories.push(parseDetails(child, null));
			child = child.next;
		}
		return TescoCategory.bulkCreate(categories, {updateOnDuplicate: ['updated_at']});
	})
	.then(function(result){
		return pullSubcategories(categories, [], Q.defer());
	})
	.then(function(result){
		categories = parsecategories('#superDeptItems', result);
		return TescoCategory.bulkCreate(categories, {updateOnDuplicate: ['updated_at']});
	})
	.then(function(result){
		return pullSubcategories(categories, [], Q.defer());
	})
	.then(function(result){
		categories = parsecategories('#deptNavItems', result);
		return TescoCategory.bulkCreate(categories, {updateOnDuplicate: ['updated_at']});
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

function parsecategories(elementId, dumps){
	var categories = [];
	dumps.forEach(function(dump){
		$ = cheerio.load(dump[1]);
		var columns = $(elementId).children('.column');
		var i = 0;
		while(true){
			var column = columns[(i++).toString()];
			if(column){
				var child = column.children[0].children[0];
				while(child){
					if(child.name == "li") categories.push(parseDetails(child, dump[0]));
					child = child.next;
				};
			}
			else break;
		}
	});
	return categories;
}

function parseDetails(dump, parentId){
	var idRegex = /N=(.*)&/;
	var a = dump.children[0];
	var category = {};
	category.id = parseInt(idRegex.exec(a.attribs.href)[1]);
	category.name = a.children[0].data;
	category.parent_id = parentId;
	category.location = a.attribs.href.substring(a.attribs.href.indexOf('www.tesco.ie') + 12);
	return category;
}

function pullSubcategories(cats, subcatsDump, deferred){
	if(cats.length == 0){
		console.log("Returning " + subcatsDump.length + " sub categories");
		deferred.resolve(subcatsDump);
	}
	else{
		console.log(color.yellow(cats.length + " remaining "));
		apiRequest(cats[0].location)
		.then(function(result){
			subcatsDump.push([cats[0].id, result]);
			cats.splice(0, 1);
			pullSubcategories(cats, subcatsDump, deferred);
		})
		.catch(function(error){
			console.log("Error: " + error);
			deferred.reject(error);
		});
	}
	return deferred.promise;
}