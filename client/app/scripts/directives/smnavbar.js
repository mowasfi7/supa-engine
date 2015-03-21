'use strict';

/**
 * @ngdoc directive
 * @name clientApp.directive:smNavbar
 * @description
 * # smNavbar
 */
 angular.module('clientApp')
 .directive('smNavbar', function () {
 	return {
 		templateUrl: '/views/directives/smnavbar.html',
 		replace: true,
 		restrict: 'E'
 	};
 });
