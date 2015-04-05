'use strict';

/**
 * @ngdoc service
 * @name clientApp.Geocode
 * @description
 * # Geocode
 * Factory in the clientApp.
 */
 angular.module('clientApp')
 .factory('Geocode', function GeocodeFactory($http) {
    return {
    	geo: function (val, component) {
    		return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
    			params: {
    				address: val,
    				components: component
    			}
    		});
    	},
    	reverseGeo: function(lat, lng) {
    		return $http.get('http://maps.googleapis.com/maps/api/geocode/json', {
    			params: {
    				latlng: lat + ',' + lng
    			}
    		});
    	}
    };
});
