var express = require('express');
var router = express.Router();
var http = require('http');

router.get('/pullproducts', function (req, res) {

	var path = '/API/2/Session.asmx/Login';
	var data = {
		"pwd":"HMsQmP3Wyr+mt",
		"userEmail":"sv_api@sv.ie",
		"appKey":"72c62b26-9892-456b-ae34-b4fcee776a7d"
	};

	supervalueRequest(path, data, res);
	
});

function supervalueRequest(path, data, res){
	var dataString = JSON.stringify(data);
	var headers = {
		'Content-Type': 'application/json',
		'Content-Length': dataString.length
	};
	var options = {
		host: 'shop.supervalu.ie',
		path: path,
		method: 'POST',
		headers: headers
	};
	var svReq = http.request(options, function(svRes) {
		var responseString;
		svRes.on('data', function(data) {
			responseString = data;
		});
		svRes.on('end', function() {
			res.json(JSON.parse(responseString));
		});
	});

	svReq.on('error', function(e) {
		console.log(e);
		res.status(err.status || 500);
	});

	svReq.write(dataString);
	svReq.end();
}

module.exports = router;

/*
function apiCall(url, req){
	$ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json', 'Connection: close'));
    curl_setopt($ch, CURLOPT_POSTFIELDS, $request);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $raw_response = curl_exec($ch);
    if (curl_errno($ch)){
        die('Error: ' . curl_error($ch));
    }
    curl_close($ch);
    $json_response = json_decode($raw_response);
    if(!isset($json_response->d)){
        die($raw_response);
    }
    else if($json_response->d->ResponseCode != '0'){
        die($json_response);
    }
    return $json_response->d;
}*/

