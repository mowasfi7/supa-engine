'use strict';

/**
* @ngdoc function
* @name clientApp.controller:MainCtrl
* @description
* # MainCtrl
* Controller of the clientApp
*/
angular.module('clientApp').controller('MainCtrl', function ($scope, $http) {
$scope.awesomeThings = [
'HTML5 Boilerplate',
'AngularJS',
'Karma'
];
$scope.post = function() {
$http.post('http://tranquil-tundra-3993.herokuapp.com/supapi/test', {msg: 'good'}).
success(function(data) {
alert("Nature: " + data.nature + "\nType: " + data.type);
}).
error(function(data, status) {
alert("Failyaaa");
console.log("Status is: " + status);
})};



$scope.get = function(){
return $http.get('http://tranquil-tundra-3993.herokuapp.com/supapi/stuff', {
params: {
msg: "another"
}
}).then(function(response){
console.log(response);
});

};


});