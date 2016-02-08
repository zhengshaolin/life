"use strict";
// 展示日程
angular.module('life').controller('ScheduleController', ['$scope', '$routeParams', '$location', '$http', '$q', function ($scope, $routeParams, $location, $http, $q) {
    $scope.token = localStorage.token;
    if (!$scope.token) {
        $location.path('/login');
        return;
    }

    $scope.user = $scope.token.split('-')[0];
    $scope.date = $routeParams.date;

    $scope.events = [];
    $scope.pool = [];

    $scope.retrospect = '';

    $http({url: '../retrospect/' + $scope.date, responseType: 'json', method: 'GET', headers: {token: $scope.token}}).then(function (response) {
        $scope.retrospect = response.data.retrospect;
    }, function (err) {
        console.log(err);
        alert(JSON.stringify(err));
    });

    $http({url: '../schedule/' + $scope.date, responseType: 'json', method: 'GET', headers: {token: $scope.token}}).then(function (response) {
        $scope.events = response.data;
    }, function (err) {
        console.log(err);
        alert(JSON.stringify(err));
    });

    $http({url: '../pool/', responseType: 'json', method: 'GET', headers: {token: $scope.token}}).then(function (response) {
        $scope.pool = response.data;
    }, function (err) {
        console.log(err);
        alert(JSON.stringify(err));
    });

    var qrcodeUrl = $location.absUrl() + '/show/' + $scope.user;
    $http({url: '../qrcode', responseType: 'json', method: 'GET', params: {text: qrcodeUrl}, headers: {token: $scope.token}}).then(function (response) {
        console.log(response.data.dataUrl);
        $scope.share_qrcode = response.data.dataUrl;
    }, function (err) {
        console.log(err);
        alert(JSON.stringify(err));
    });

    $scope.share_qrcode = '';

    $scope.insertEvent = function (index) {
        $scope.events.splice(index + 1, 0, {user: $scope.user, begin: $scope.date});
    };

    $scope.removeEvent = function (index) {
        $scope.events[index].deleted = true;
    };

    $scope.layToPool = function (index) {
        var event = angular.copy($scope.events[index]);
        delete event._id;
        delete event.time;
        delete event.completion;
        delete event.retrospect;
        delete event.duration;
        event.priority = "100";
        $scope.pool.push(event);
    };

    $scope.moveOutOfPool = function (index) {
        var event = $scope.pool[index];
        delete event.priority;
        event.user = $scope.user;
        event.begin = $scope.date;
        event.completion = "0";
        $scope.pool.splice(index, 1);
        $scope.events.push(event);
    };

    $scope.addEventInPool = function () {
        $scope.pool.push({});
    };

    $scope.removeEventInPool = function (index) {
        $scope.pool.splice(index, 1);
    };

    $scope.save = function () {
        console.log($scope.events);
        console.log($scope.pool);
        var promises = [];

        promises.push($http({url: '../retrospect/' + $scope.date, responseType: 'json', method: 'PUT', headers: {token: $scope.token}, data: {retrospect: $scope.retrospect}}));
        promises.push($http({url: '../schedule/' + $scope.date, responseType: 'json', method: 'PUT', headers: {token: $scope.token}, data: $scope.events}));
        promises.push($http({url: '../pool/', responseType: 'json', method: 'PUT', headers: {token: $scope.token}, data: $scope.pool}));

        $q.all(promises).then(function (responses) {
            $http({url: '../schedule/' + $scope.date, responseType: 'json', method: 'GET', headers: {token: $scope.token}}).then(function (response) {
                $scope.events = response.data;
                alert('SAVED');
            }, function (err) {
                console.log(err);
                alert(JSON.stringify(err));
            });
        }, function (err) {
            console.log(err);
            alert(JSON.stringify(err));
        });
    };

    $scope.totalDuration = function () {
        if ($scope.events && $scope.events.length > 0) {
            return $scope.events.reduce(function (prev, curr) {
                if (!curr.deleted) {
                    var duration = parseFloat(curr.duration);
                    return prev + duration;
                } else {
                    return prev;
                }
            }, 0);
        } else {
            return 0;
        }
    };

    $scope.totalCompletion = function () {
        if ($scope.events && $scope.events.length > 0) {
            var completion = $scope.events.reduce(function (prev, curr) {
                if (!curr.deleted) {
                    prev.totalHour += parseFloat(curr.duration);
                    prev.completedHour += parseFloat(curr.completion) * parseFloat(curr.duration) / 100;
                }
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
                if (!curr.deleted) {
                    if (curr.type) {
                        if (prev[curr.type]) {
                            prev[curr.type] += parseFloat(curr.duration);
                        } else {
                            prev[curr.type] = parseFloat(curr.duration);
                        }
                    }
                }
                return prev;
            }, {});
        } else {
            return {};
        }
    };
}]);
