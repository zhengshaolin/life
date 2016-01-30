"use strict";

angular.module('life', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
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
        when('/english/:date', {
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
