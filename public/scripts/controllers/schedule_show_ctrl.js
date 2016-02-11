"use strict";
// 展示日程
angular.module('life')
    .controller('ScheduleShowController', ['$scope', '$routeParams', '$location', '$http', function ($scope, $routeParams, $location, $http) {
    $scope.token = localStorage.token;
    if (!$scope.token) {
        $location.path('/login');
        return;
    }

    $scope.user = $scope.token.split('-')[0];
    $scope.date = $routeParams.date;
    $scope.other = $routeParams.other;

    $scope.retrospect = '';

    $http({url: '../retrospect/' + $scope.date + '/show/' + $scope.other, responseType: 'json', method: 'GET', headers: {token: $scope.token}}).then(function (response) {
        $scope.retrospect = response.data.retrospect;
    }, function (err) {
        console.log(err);
        alert(JSON.stringify(err));
    });

    $http({url: '../schedule/' + $scope.date + '/show/' + $scope.other, responseType: 'json', method: 'GET', headers: {token: $scope.token}}).then(function (response) {
        $scope.events = response.data;
        console.log($scope.events);
    }, function (err) {
        console.log(err);
        alert(JSON.stringify(err));
    });

    $scope.totalDuration = function () {
        if ($scope.events && $scope.events.length > 0) {
            return $scope.events.reduce(function (prev, curr) {
                var duration = parseFloat(curr.duration);
                return prev + duration;
            }, 0);
        } else {
            return 0;
        }
    };

    $scope.totalCompletion = function () {
        if ($scope.events && $scope.events.length > 0) {
            var completion = $scope.events.reduce(function (prev, curr) {
                prev.totalHour += parseFloat(curr.duration);
                prev.completedHour += parseFloat(curr.completion) * parseFloat(curr.duration) / 100;
                return prev;
            }, {totalHour: 0.0, completedHour: 0.0});

            return Math.round(completion.completedHour * 10000 / completion.totalHour) / 100;
        } else {
            return 0;
        }
    };

    $scope.distribution = function () {
        if ($scope.events) {
            return $scope.events.reduce(function (prev, curr) {
                if (curr.type) {
                    if (prev[curr.type]) {
                        prev[curr.type] += parseFloat(curr.duration);
                    } else {
                        prev[curr.type] = parseFloat(curr.duration);
                    }
                }
                return prev;
            }, {});
        } else {
            return {};
        }
    };
}]);
