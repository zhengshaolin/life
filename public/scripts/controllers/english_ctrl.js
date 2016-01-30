"use strict";
angular.module('life').controller('EnglishController', ['$scope', '$routeParams', '$location', '$http', '$q', function ($scope, $routeParams, $location, $http, $q) {
    $scope.token = localStorage.token;
    if (!$scope.token) {
        $location.path('/login');
        return;
    }

    $scope.user = $scope.token.split('-')[0];

    if ($routeParams.date) {
        $scope.today = moment($routeParams.date);
    } else {
        $scope.today = moment();
    }

    $scope.dates = [];
    $scope.dates.push($scope.today.format('YYYY-MM-DD'));
    $scope.dates.push($scope.today.add(1, 'days').format('YYYY-MM-DD'));
    $scope.dates.push($scope.today.add(1, 'days').format('YYYY-MM-DD'));
    $scope.dates.push($scope.today.add(1, 'days').format('YYYY-MM-DD'));
    $scope.dates.push($scope.today.add(1, 'days').format('YYYY-MM-DD'));
    $scope.dates.push($scope.today.add(1, 'days').format('YYYY-MM-DD'));
    $scope.dates.push($scope.today.add(1, 'days').format('YYYY-MM-DD'));

    $scope.newWords = {};

    $scope.datesQuery = $scope.dates.reduce(function (prev, curr, index, array) {
        if (index == 0) {
            return curr;
        } else {
            return prev + ',' + curr;
        }
    });

    $http({url: '../words', method: 'GET', responseType: 'json', params: {dates: $scope.datesQuery}, headers: {token: $scope.token}}).then(function (response) {
        $scope.words = response.data;
    }, function (err) {
        console.log(err);
        alert(JSON.stringify(err));
    });

    $scope.save = function (date) {
        $scope.words[date].first.forEach(function (word) {
            if (word.example) {
                word.completion = true;
            } else {
                word.completion = false;
            }
        });
        $scope.words[date].revise.forEach(function (word) {
            if (word.example) {
                word.completion = true;
            } else {
                word.completion = false;
            }
        });

        var promises = [];

        if ($scope.newWords[date]) {
            var newWords = $scope.newWords[date].split(',').map(function (word) {
                return word.trim();
            });

            var postNewWords = $http({url: '../words/' + date, method: 'POST', responseType: 'json', data: newWords, headers: {token: $scope.token}});
            promises.push(postNewWords);
        }

        var updateWords = $http({url: '../words/' + date, method: 'PUT', responseType: 'json', data: $scope.words[date], headers: {token: $scope.token}});
        promises.push(updateWords);

        $q.all(promises).then(function (responses) {
            return $http({url: '../words', method: 'GET', responseType: 'json', params: {dates: $scope.datesQuery}, headers: {token: $scope.token}});
        }, function (err) {
            console.log(err);
            alert(JSON.stringify(err));
        }).then(function (response) {
            $scope.newWords = {};
            $scope.words = response.data;
        });
    }
}]);
