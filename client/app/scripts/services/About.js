'use strict';

/**
 * @ngdoc service
 * @name clientApp.About
 * @description
 * # About
 * Factory in the clientApp.
 */

angular.module('clientApp')
 .factory('About', function AboutFactory($resource) {
    return $resource('/about/:item');
});
