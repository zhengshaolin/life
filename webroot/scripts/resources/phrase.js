angular.module('life')
  .factory('Phrase', function ($resource) {
    return $resource("/word/:word/phrase/:id", {
      word: '@word',
      id: '@_id'
    });
  });
