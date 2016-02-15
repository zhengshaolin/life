'use strict';

angular.module('life').controller('LoginController', ['$scope', '$location', '$http', function ($scope, $location, $http) {
    $scope.login = function() {
        $http({url: '/token', method: 'GET', responseType: 'json', params: {username: $scope.username, password: $scope.password}}).then(function (response) {
            localStorage.token = response.data.token;
            $location.path('/english');
        }, function (err) {
            console.log(err);
            alert(JSON.stringify(err));
        });
    }
}]);
