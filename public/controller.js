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
            alert(JSON.stringify(err));
        });
    }
}]);

// 展示日程
Life.controller('ScheduleController', ['$scope', '$routeParams', '$location', '$http', '$q', function ($scope, $routeParams, $location, $http, $q) {
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
        alert(JSON.stringify(err));
    });

    $http({url: '../schedule/' + $scope.date, responseType: 'json', method: 'GET', headers: {token: $scope.token}}).then(function (response) {
        $scope.events = response.data;
        console.log($scope.events);
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
        var promises = [];

        promises.push($http({url: '../retrospect/' + $scope.date, responseType: 'json', method: 'PUT', headers: {token: $scope.token}, data: {retrospect: $scope.retrospect}}));
        promises.push($http({url: '../schedule/' + $scope.date, responseType: 'json', method: 'PUT', headers: {token: $scope.token}, data: $scope.events}));

        $q.all(promises).then(function (responses) {
            $http({url: '../schedule/' + $scope.date, responseType: 'json', method: 'GET', headers: {token: $scope.token}}).then(function (response) {
                $scope.events = response.data;
                $scope.changed = false;
                console.log($scope.events);
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

// 展示日程
Life.controller('ScheduleShowController', ['$scope', '$routeParams', '$location', '$http', function ($scope, $routeParams, $location, $http) {
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

Life.controller('EnglishController', ['$scope', '$location', '$http', '$q', function ($scope, $location, $http, $q) {
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

// 404
Life.controller('MissingController', function () {
});

Life.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/schedule/:date', {
            controller: 'ScheduleController',
            templateUrl: 'schedule.html'
        }).
        when('/schedule/:date/show/:other', {
            controller: 'ScheduleShowController',
            templateUrl: 'schedule_show.html'
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
