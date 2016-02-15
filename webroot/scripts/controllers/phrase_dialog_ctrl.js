angular.module('life').controller('PhraseDialogCtrl', function ($scope, $uibModalInstance, word, phrase) {

  $scope.word = word;
  $scope.phrase = phrase || {};


  $scope.ok = function () {
    $scope.phrase.word = word.word;
    $uibModalInstance.close($scope.phrase);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
