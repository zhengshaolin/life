'use strict';

/**
 * @ngdoc function
 * @name life.controller:AboutCtrl
 * @description
 * # NavCtrl
 * Controller of the otpApp
 */
angular.module('life')
  .controller('NavCtrl', function ($scope, $location) {
    $scope.$on("$routeChangeSuccess", function (e, current) {
      var path = $location.path();
      if (/^\/english/.test(path)) {
        $scope.highlight = 'english';
      } else if (/^\/plan/.test(path)) {
        $scope.highlight = 'plan';
      } else {
        $scope.highlight = 'homepage';
      }
    });


  });
