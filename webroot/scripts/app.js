"use strict";

angular.module('life', ['ngRoute', 'ngResource', 'ui.bootstrap'])
    .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/schedule/:date', {
            controller: 'ScheduleController',
            templateUrl: 'views/schedule.html'
        }).
        when('/schedule/:date/show/:other', {
            controller: 'ScheduleShowController',
            templateUrl: 'views/schedule_show.html'
        }).
        when('/plan/daily', {
            controller: 'DailyPlanController',
            templateUrl: 'views/daily_plan.html'
        }).
        when('/plan/weekly', {
            controller: 'WeeklyPlanController',
            templateUrl: 'views/weekly_plan.html'
        }).
        when('/english', {
            controller: 'EnglishController',
            templateUrl: 'views/english.html'
        }).
        when('/login', {
            controller: 'LoginController',
            templateUrl: 'views/login.html'
        }).
        when('/missing', {
            controller: 'MissingController',
            templateUrl: '404.html'
        }).
        otherwise({
            redirectTo: '/missing'
        });
}]);
