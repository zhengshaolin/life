angular.module('life').controller('PhraseDialogCtrl', function ($scope, $uibModalInstance, word) {

  $scope.word = word;


  $scope.ok = function () {
    $uibModalInstance.close({
      word: $scope.word.word,
      phrase: $scope.newPhrase
    });
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
