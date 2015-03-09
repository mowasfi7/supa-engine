var express = require('express');
var router = express.Router();
var http = require('http');

var path, data, response, sessionKey;

var supervalueRequest = function(req, res, next){
	var dataString = JSON.stringify(data);
	var headers = {
		'Content-Type': 'application/json',
		'Content-Length': dataString.length
	};
	var options = {
		hostname: 'shop.supervalu.ie',
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
			response = JSON.parse(responseString);
			if(response.d){
				if(response.d.ResponseCode == 0){
					response = response.d;
					next();
				}
				else{
					res.status(500).send(response.d.ResponseInfo);
				}
				
			}
			else{
				res.status(500).send("response.d not found");
			}
		});
	});

	svReq.on('error', function(e) {
		console.log(e);
		res.status(500).send("error connecting to " + path);
	});

	svReq.write(dataString);
	svReq.end();
};

router.get('/pullproducts',
	function (req, res, next) {
		path = '/API/2/Session.asmx/Login';
		data = {"pwd":"HMsQmP3Wyr+mt",
				"userEmail":"sv_api@sv.ie",
				"appKey":"72c62b26-9892-456b-ae34-b4fcee776a7d"};
		next();
	},
	supervalueRequest,
	function (req, res, next) {
		path = '/API/2/Assortment.asmx/GetCategoryTree';
		data = {"type":"N",
				"cacheDate":"20100101 00:01",
				"cacheStoreID":1713,
				"sessionKey": response.SessionKey};
		next();
	},
	supervalueRequest,
	function(req, res){
		res.json(response);
});


module.exports = router;