'use strict';

/**
 * @ngdoc function
 * @name clietnApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
.controller('HomeCtrl', function ($scope, $http, $window) {
    // we will store all of our form data in this object
    $scope.formData = {};

    $scope.supportsGeo = $window.navigator;
    $scope.errormessage = null;

    $scope.post = function() {
        $http.post('http://tranquil-tundra-3993.herokuapp.com/supapi/test', {msg: 'good'}).
        success(function(data) {
            alert('Nature: ' + data.nature + '\nType: ' + data.type);
        }).
        error(function(data, status) {
            alert('Failyaaa');
            console.log('Status is: ' + status);
        });
    };

    $scope.get = function(){
        return $http.get('http://tranquil-tundra-3993.herokuapp.com/supapi/stuff', {
            params: {
                msg: 'another'
            }
        }).then(function(response){
            console.log(response);
        });
    };

    // function to process the form
    $scope.processForm = function() {
        alert('Location name is: ' + $scope.formData.location.formatted_address +
            '\nLocation lat is: ' + $scope.formData.location.lat +
            '\nLocation lng is: ' + $scope.formData.location.lng +
            '\nShoppinglist is: ' + $scope.formData.list);
    };

    // for getting the location when the user types it
    $scope.getLocation = function(val) {
        return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: val,
                components: 'country:IE'
            }
        }).then(function(response){
            return response.data.results.map(function(item){
                return {
                    lat: item.geometry.location.lat,
                    lng: item.geometry.location.lng,
                    formatted_address: item.formatted_address
                };
            });
        });
    };

    function setLocation(aName, aLat, aLng){
        $scope.formData.location = {
            lat: aLat,
            lng: aLng,
            formatted_address: aName
        };
    }

    // for grabbing the location when the user allows us to
    $scope.getGeoLocation = function() {
        $scope.statusMessage = 'Determining location...';
        $window.navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            $scope.$apply(function() {
                setLocation('', lat, lng);
                $scope.next = true;
                $scope.statusMessage = '';
            });
            return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
                params: {
                    latlng: lat + ',' + lng
                }
            }).then(function(response){
                setLocation(response.data.results[0].formatted_address, lat, lng);
            });
        }, function(error) {
            $scope.statusMessage = '';
            $scope.$apply(function(){
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                    $scope.errormessage = 'You denied the request for Geolocation.';
                    break;
                    case error.POSITION_UNAVAILABLE:
                    $scope.errormessage = 'Location information is unavailable.';
                    break;
                    case error.TIMEOUT:
                    $scope.errormessage = 'The request to get location timed out.';
                    break;
                    case error.UNKNOWN_ERROR:
                    $scope.errormessage = 'An unknown error occurred.';
                    break;
                }
            });
        });
    };
});
