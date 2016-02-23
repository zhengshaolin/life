"use strict";
angular.module('life').controller('EnglishController', function ($scope, $route, $routeParams, $location, $http, $q, $uibModal, Phrase) {
  $scope.token = localStorage.token;
  if (!$scope.token) {
    $location.path('/login');
    return;
  }

  var today;
  if ($routeParams.date) {
    today = moment($routeParams.date);
  } else {
    var now = new Date().getTime();
    now = now - (3600 * 3 * 1000);
    today = moment(now);
  }

  $scope.date = today.format('YYYY-MM-DD');
  $scope.newPhrase = {};

  function addPhrase(p) {
    var phrase = new Phrase(p);
    phrase.$save().then(function (res) {
      $route.reload();
    });
  }

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

  $scope.save = function (word, phraseId) {
    $http({
      url: '/words/' + $scope.date,
      method: 'PUT',
      responseType: 'json',
      data: word,
      headers: {token: $scope.token}
    }).then(function () {
      console.log('save success');
      $scope.englishForm.$setPristine();
    });

  };

  $scope.openPhraseDialog = function (word, phrase) {

    var modalInstance = $uibModal.open({
      templateUrl: 'phrase_dialog.html',
      controller: 'PhraseDialogCtrl',
      resolve: {
        word: function () {
          return word;
        },
        phrase: function () {
          return phrase;
        }
      }
    });

    modalInstance.result.then(function (phrase) {
      addPhrase(phrase);
    });
  };
});
