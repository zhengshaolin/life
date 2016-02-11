var express = require('express');
var router = express.Router();

var English = require('../english');

router.get("/word/:word/phrase", function (req, res) {
  English.findPhrasesByWord(req.params.word, 'keyser').then(function (phrases) {
    res.json(phrases);
  });
});

router.post("/word/:word/phrase", function (req, res) {
  var phrase = req.body;
  phrase.user = 'keyser';
  English.insertPhrase(phrase).then(function (phrase) {
    res.json(phrase);
  });
});

module.exports = router;
