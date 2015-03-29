var express = require('express');
var router = express.Router();
var http = require('follow-redirects').http;
var cheerio = require('cheerio');

router.get('/pullproducts',
	function (req, res, next) {
		var headers = {
		'Accept-Encoding': 'gzip'
		};

		var options = {
			hostname: 'www.tesco.ie',
			path: '/groceries',
			method: 'GET',
			headers: headers
		};
		var tescoReq = http.get(options, function(tescoRes) {
			var responseString = '';
			tescoRes.on('data', function(data) {
				responseString += data;
			});
			tescoRes.on('end', function() {
				var departments = [];
				$ = cheerio.load(responseString);
				$('#secondaryNav').children()[0].children.forEach(function(child){
					if(child.name == "li"){
						child.children.forEach(function(child){
							if(child.name == 'a'){
								var department = {};
								department.name = child.children[0].data;
								department.location = child.attribs.href;
								departments.push(department);
							}
						});
					}
				});
				res.json(departments);
			});
		});
	}
);

module.exports = router;