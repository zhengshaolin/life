var express = require('express');
var router = express.Router();

var English = require('../english');

router.get("/word/:word/phrase", function (req, res) {
  English.findPhrasesByWord(req.params.word, req.cookies.username).then(function (phrases) {
    res.json(phrases);
  });
});

router.post("/word/:word/phrase", function (req, res) {
  var phrase = req.body;
  phrase.user = req.cookies.username;
  English.insertPhrase(phrase).then(function () {
    res.json(phrase);
  });
});

router.post("/word/:word/phrase/:id", function (req, res) {
  var phrase = req.body;
  phrase.user = req.cookies.username;
  English.updatePhrase(phrase).then(function () {
    res.json(phrase);
  });
});

module.exports = router;
