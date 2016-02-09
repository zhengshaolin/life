"use strict";
angular.module('life').controller('EnglishController', function ($scope, $routeParams, $location, $http, $q) {
  $scope.token = localStorage.token;
  if (!$scope.token) {
    $location.path('/login');
    return;
  }

  $scope.user = $scope.token.split('-')[0];

  var today;
  if ($routeParams.date) {
    today = moment($routeParams.date);
  } else {
    today = moment();
  }

  $scope.date = today.format('YYYY-MM-DD');

  $scope.newWords = {};


  $http({
    url: '/words/' + $scope.date,
    method: 'GET',
    headers: {token: $scope.token}
  }).then(function (response) {
    $scope.content = response.data;
  }, function (err) {
    console.log(err);
    alert(JSON.stringify(err));
  });

  $scope.save = function (date) {
    $scope.words[date].first.forEach(function (word) {
      word.completion = !!word.example;
    });
    $scope.words[date].revise.forEach(function (word) {
      word.completion = !!word.example;
    });

    var promises = [];

    if ($scope.newWords[date]) {
      var newWords = $scope.newWords[date].split(',').map(function (word) {
        return word.trim();
      });

      var postNewWords = $http({
        url: '/words/' + date,
        method: 'POST',
        responseType: 'json',
        data: newWords,
        headers: {token: $scope.token}
      });
      promises.push(postNewWords);
    }

    var updateWords = $http({
      url: '/words/' + date,
      method: 'PUT',
      responseType: 'json',
      data: $scope.words[date],
      headers: {token: $scope.token}
    });
    promises.push(updateWords);

    $q.all(promises).then(function (responses) {
      return $http({
        url: '/words',
        method: 'GET',
        responseType: 'json',
        params: {dates: $scope.datesQuery},
        headers: {token: $scope.token}
      });
    }, function (err) {
      console.log(err);
      alert(JSON.stringify(err));
    }).then(function (response) {
      $scope.newWords = {};
      $scope.words = response.data;
    });
  }
});
