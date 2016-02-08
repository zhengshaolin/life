"use strict";
angular.module('life')
    .controller('WeeklyPlanController', ['$scope', '$location', '$http', function ($scope, $location, $http) {

    $scope.token = localStorage.token;
    if (!$scope.token) {
        $location.path('/login');
        return;
    }

    $scope.user = $scope.token.split('-')[0];

    $scope.weekdays = [[], [], [], [], [], [], []];
    $scope.weekdayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    $scope.changed = false;

    $scope.today = moment().format("YYYY-MM-DD");

    $http({url: '../plan/weekly', method: 'GET', responseType: 'json', headers: {token: $scope.token}}).then(function (res) {
        $scope.weekdays = res.data.weekdays;
        $scope.changed = false;
    }, function (err) {
        console.log(err);
        alert(JSON.stringify(err));
    });

    $scope.setChanged = function (changed) {
        $scope.changed = changed;
    };

    $scope.newEvent = function(weekday) {
        $scope.weekdays[weekday].push({
            type: undefined,
            time: undefined,
            duration: undefined,
            affair: undefined,
            objective: undefined,
            checkpoint: undefined
        });
    };

    $scope.removeEvent = function(weekday, index) {
        $scope.weekdays[weekday].splice(index, 1);
        $scope.changed = true;
    };

    $scope.save = function () {
        var plan = {user: $scope.user, type: 'weekly', weekdays: $scope.weekdays};
        $http({url: '../plan/weekly', method: 'PUT', responseType: 'json', data: plan, headers: {token: $scope.token}}).then(function (res) {
            $scope.changed = false;
        }, function (err) {
            console.log(err);
            alert(JSON.stringify(err));
        });
    };
}]);
