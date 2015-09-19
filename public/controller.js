"use strict";

/**
 * Created by zhengshaolin on 15/9/12.
 */

var Life = angular.module('life', ['ngRoute']);

// 登陆
Life.controller('LoginController', ['$scope', '$location', '$http', function ($scope, $location, $http) {
    $scope.login = function() {
        $http({url: '../token', method: 'GET', responseType: 'json', params: {username: $scope.username, password: $scope.password}}).then(function (response) {
            localStorage.token = response.data.token;
            $location.path('/schedule/' + moment().format('YYYY-MM-DD'));
        }, function (err) {
            console.log(err);
            alert(err.responseText);
        });
    }
}]);

// 展示日程
Life.controller('ScheduleController', ['$scope', '$routeParams', '$location', '$http', function ($scope, $routeParams, $location, $http) {
    $scope.token = localStorage.token;
    if (!$scope.token) {
        $location.path('/login');
        return;
    }

    $scope.user = $scope.token.split('-')[0];
    $scope.date = $routeParams.date;
    $scope.changed = false;

    $scope.retrospect = '';

    $http({url: '../retrospect/' + $scope.date, responseType: 'json', method: 'GET', headers: {token: $scope.token}}).then(function (response) {
        $scope.retrospect = response.data.retrospect;
    }, function (err) {
        console.log(err);
        alert(err.toString());
    });

    $http({url: '../schedule/' + $scope.date, responseType: 'json', method: 'GET', headers: {token: $scope.token}}).then(function (response) {
        $scope.events = response.data;
        console.log($scope.events);
    }, function (err) {
        console.log(err);
        alert(err.toString());
    });

    $scope.setChanged = function (changed) {
        $scope.changed = changed;
    };

    $scope.insertEvent = function (index) {
        $scope.events.splice(index + 1, 0, {user: $scope.user, begin: $scope.date});
        $scope.changed = true;
    };

    $scope.removeEvent = function (index) {
        $scope.events.splice(index, 1);
        $scope.changed = true;
    };

    $scope.save = function () {
        $http({url: '../retrospect/' + $scope.date, responseType: 'json', method: 'PUT', headers: {token: $scope.token}, data: {retrospect: $scope.retrospect}}).then(function (result) {
        }, function (err) {
            console.log(err);
            alert(err.toString());
        });

        $http({url: '../schedule/' + $scope.date, responseType: 'json', method: 'PUT', headers: {token: $scope.token}, data: $scope.events}).then(function (result) {
            $scope.changed = false;
        }, function (err) {
            console.log(err);
            alert(err.toString());
        });
    }
}]);

// 管理模版
Life.controller('DailyPlanController', ['$scope', '$location', '$http', function ($scope, $location, $http) {
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
        alert(err.toString());
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
            alert(err.toString());
        });
    };
}]);

Life.controller('WeeklyPlanController', ['$scope', '$location', '$http', function ($scope, $location, $http) {
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
        alert(err.toString());
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
            alert(err.toString());
        });
    };
}]);

Life.controller('EnglishController', ['$scope', '$location', '$http', function ($scope, $location, $http) {
    $scope.token = localStorage.token;
    if (!$scope.token) {
        $location.path('/login');
        return;
    }

    $scope.user = $scope.token.split('-')[0];

    $scope.today = moment();

    $scope.dates = [];
    $scope.dates.push($scope.today.format('YYYY-MM-DD'));
    $scope.dates.push($scope.today.add(1, 'days').format('YYYY-MM-DD'));
    $scope.dates.push($scope.today.add(1, 'days').format('YYYY-MM-DD'));
    $scope.dates.push($scope.today.add(1, 'days').format('YYYY-MM-DD'));
    $scope.dates.push($scope.today.add(1, 'days').format('YYYY-MM-DD'));
    $scope.dates.push($scope.today.add(1, 'days').format('YYYY-MM-DD'));
    $scope.dates.push($scope.today.add(1, 'days').format('YYYY-MM-DD'));

    var datesQuery = $scope.dates.reduce(function (prev, curr, index, array) {
        if (index == 0) {
            return curr;
        } else {
            return prev + ',' + curr;
        }
    });

    $http({url: '../words', method: 'GET', responseType: 'json', params: {dates: datesQuery}, headers: {token: $scope.token}}).then(function (response) {
        $scope.words = response.data;
    }, function (err) {
        console.log(err);
        alert(err.toString());
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

        console.log($scope.words[date]);
    }
}]);

// 404
Life.controller('MissingController', function () {
});

Life.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/schedule/:date', {
            controller: 'ScheduleController',
            templateUrl: 'schedule.html'
        }).
        when('/plan/daily', {
            controller: 'DailyPlanController',
            templateUrl: 'daily_plan.html'
        }).
        when('/plan/weekly', {
            controller: 'WeeklyPlanController',
            templateUrl: 'weekly_plan.html'
        }).
        when('/english', {
            controller: 'EnglishController',
            templateUrl: 'english.html'
        }).
        when('/login', {
            controller: 'LoginController',
            templateUrl: 'login.html'
        }).
        when('/missing', {
            controller: 'MissingController',
            templateUrl: '404.html'
        }).
        otherwise({
            redirectTo: '/missing'
        });
}]);
