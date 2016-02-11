"use strict";
// 管理模版
angular.module('life')
    .controller('DailyPlanController', function ($scope, $location, $http) {
    $scope.token = localStorage.token;
    if (!$scope.token) {
        $location.path('/login');
        return;
    }

    $scope.user = $scope.token.split('-')[0];

    $scope.events = [];
    $scope.changed = false;

    $scope.today = moment().format("YYYY-MM-DD");

    $http({url: '../plan/daily', method: 'GET', responseType: 'json', headers: {token: $scope.token}}).then(function (res) {
        $scope.events = res.data.events;
        $scope.changed = false;
    }, function (err) {
        console.log(err);
        alert(JSON.stringify(err));
    });

    $scope.setChanged = function (changed) {
        $scope.changed = changed;
    };

    $scope.newEvent = function() {
        $scope.events.push({
            type: undefined,
            time: undefined,
            duration: undefined,
            affair: undefined,
            objective: undefined,
            checkpoint: undefined
        });
    };

    $scope.removeEvent = function(index) {
        $scope.events.splice(index, 1);
        $scope.changed = true;
    };

    $scope.save = function () {
        var plan = {user: $scope.user, type: 'daily', events: $scope.events};
        $http({url: '../plan/daily', method: 'PUT', responseType: 'json', data: plan, headers: {token: $scope.token}}).then(function (res) {
            $scope.changed = false;
        }, function (err) {
            console.log(err);
            alert(JSON.stringify(err));
        });
    };
});
