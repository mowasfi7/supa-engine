'use strict';

/**
 * @ngdoc function
 * @name clientApp.controller:ProfilePersonalEditCtrl
 * @description
 * # ProfilePersonalEditCtrl
 * Controller of the clientApp
 */
angular.module('clientApp')
  .controller('ProfilePersonalEditCtrl', function ($scope, $modalInstance) {
    $scope.ok = function () {
      $modalInstance.close();
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
  });
