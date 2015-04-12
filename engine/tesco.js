var http = require('follow-redirects').http;
var cheerio = require('cheerio');
var color = require('cli-color');

var pullDepartments = function(callback){
	console.log(color.cyan('Pulling Tesco Departments'));
	var headers = { 'Accept-Encoding': 'gzip' };
	var options = {
		hostname: 'www.tesco.ie',
		path: '/groceries',
		method: 'GET',
		headers: headers
	};
	http.get(options, function(tescoRes) {
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
			console.log(color.green("Returning Tesco " + departments.length + " Departments"));
			if(departments.length == 0) callback(null, "No departments found");
			else callback(departments);
		});

		tescoRes.on('error', function(err) {
			callback(null, err);
		});
	});
};

exports.pullDepartments = pullDepartments;