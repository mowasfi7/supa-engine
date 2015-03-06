'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
      $scope.post = function() {
  	return $http.post('http://tranquil-tundra-3993.herokuapp.com/supapi/stuff',
  					  {msg: "something"}).then(function(response){
    	console.log(response);
    	alert(response.data.name);
    });

  	// $http.get('localhost:3000/').
	  // success(function(data, status, headers, config) {
	  //   // this callback will be called asynchronously
	  //   // when the response is available
	  //   alert(data + "\n" + status + "\n" + headers + "\n" + config);
	  // }).
	  // error(function(data, status, headers, config) {
	  //   // called asynchronously if an error occurs
	  //   // or server returns response with an error status.
	  //   alert(data + "\n" + status + "\n" + headers + "\n" + config);
	  // });
	};

	$scope.get = function(){
		  	return $http.get('http://tranquil-tundra-3993.herokuapp.com/supapi/stuff', {
			      params: {
			        msg: "another"
			      }
			    }).then(function(response){
			    	console.log(response);
			    });

	  // $http.post('localhost:3000').
	  // success(function(data, status, headers, config) {
	  //   // this callback will be called asynchronously
	  //   // when the response is available
	  //   alert(data + "\n" + status + "\n" + headers + "\n" + config);
	  // }).
	  // error(function(data, status, headers, config) {
	  //   // called asynchronously if an error occurs
	  //   // or server returns response with an error status.
	  //   alert(data + "\n" + status + "\n" + headers + "\n" + config);
	  // });
  };


  });

