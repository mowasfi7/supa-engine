'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ProfilePersonalCtrl
 * @description
 * # ProfilePersonalCtrl
 * Controller of the clientApp
 */
 angular.module('clientApp')
 .controller('ProfilePersonalCtrl', function ($scope, $modal, $log) {
 	$scope.open = function (size) {

 		var modalInstance = $modal.open({
 			templateUrl: 'views/profile-personal-edit.html',
 			controller: 'ProfilePersonalEditCtrl',
 			size: size
 		});

 		modalInstance.result.then(function () {
 			$log.info('Modal dismissed at: ' + new Date());
 		});
 	};
 });
