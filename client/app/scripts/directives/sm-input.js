'use strict';

/**
 * @ngdoc directive
 * @name clientApp.directive:smInput
 * @description
 * # smInput
 */
 angular.module('clientApp')
 .directive('smInput', function () {
 	return {
 		templateUrl: '../../views/directives/sm-input.html',
 		replace: true,
 		restrict: 'E',
 		scope: {
 			label: '@',
 			value: '@',
 			type: '@'
 		}
 	};
 });
