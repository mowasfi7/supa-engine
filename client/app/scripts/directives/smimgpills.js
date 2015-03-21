'use strict';

/**
 * @ngdoc directive
 * @name clientApp.directive:smImgPills
 * @description
 * # smImgPills
 */
angular.module('clientApp')
  .directive('smImgPills', function () {
    return {
      templateUrl: '../../views/directives/smimgpills.html',
      restrict: 'E',
      replace: true,
      scope:{
      	link: '@',
      	img: '@',
      	text: '@'
      }
    };
  });
