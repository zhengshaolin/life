"use strict";
angular.module('life').controller('EnglishController', function ($scope, $route, $routeParams, $location, $http, $q, Phrase) {
  $scope.token = localStorage.token;
  if (!$scope.token) {
    $location.path('/login');
    return;
  }

  var today;
  if ($routeParams.date) {
    today = moment($routeParams.date);
  } else {
    today = moment();
  }

  $scope.date = today.format('YYYY-MM-DD');
  $scope.newPhrase = {};

  $scope.addPhrase = function (word) {
    var phraseString = $scope.newPhrase[word];
    var phrase = new Phrase({
      phrase: phraseString,
      word: word
    });
    phrase.$save().then(function (res) {
      console.log(res);
      $route.reload();
    });
  };

  $scope.addWords = function () {
    var newWords = $scope.newWords.split(',').map(function (word) {
      return word.trim();
    });
    $http({
      url: '/words/' + $scope.date,
      method: 'POST',
      responseType: 'json',
      data: newWords,
      headers: {token: $scope.token}
    }).then(function (res) {
      console.log(res);
      $route.reload();
    }, function (res) {
      console.error(res);
    });
  };

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

  $scope.save = function (word) {
    $http({
      url: '/words/' + $scope.date,
      method: 'PUT',
      responseType: 'json',
      data: word,
      headers: {token: $scope.token}
    });

  }
});
