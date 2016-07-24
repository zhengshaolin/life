"use strict";

var moment = require('moment');
var ObjectID = require('mongodb').ObjectID;

var db = null;

exports.bind_db = function (dbToBind) {
  db = dbToBind;
};

/**
 * 英语应用
 * 1.展示某日单词复习表
 * 2.添加新词
 * 3.删除词
 *
 * 单词表 words
 * words {
 *     word: 'envision', // 单词
 *     memory: 1, // 记忆曲线重的排位，1为首次背，2为当日复习，3为次日复习，以此类推
 *     date: '2015-09-19', // 日期
 *     example: 'I can't envision him doing that.', // 例句
 *     completion: true // 背诵完成
 * }
 *
 * 单词操作
 * 1.新词：插入整条复习曲线
 * 2.完成某次的背诵：输入单词，日期，memory序号，例句
 * 3.读取某日的全部单词，按memory=1和memory!=1分成两组
 */

function insert_word(word) {
  return new Promise(function (resolve, reject) {
    db.collection('words').insert(word, function (err, result) {
      if (!err) {
        resolve(result);
      } else {
        reject('insert_word failed, caused by: ' + err);
      }
    });
  });
}

exports.insertPhrase = insertPhrase;
function insertPhrase(phrase) {
  return new Promise(function (resolve, reject) {
    db.collection('phrases').insertOne(phrase, function (err, result) {
      if (!err) {
        resolve(phrase);
      } else {
        reject('insert phrase failed, caused by: ' + err);
      }
    })
  })
}
exports.updatePhrase = updatePhrase;
function updatePhrase(phrase) {
  return new Promise(function (resolve, reject) {
    let id = phrase._id;
    delete phrase._id;
    db.collection('phrases').updateOne({_id: ObjectID(id)}, {$set: phrase}, function (err, result) {
      if (err) {
        reject('update phrases failed, caused by: ' + err.toString());
      } else {
        resolve(result);
      }
    });
  })
}

exports.findPhrasesByWord = findPhrasesByWord;
function findPhrasesByWord(word, user) {
  return new Promise(function (resolve, reject) {
    db.collection('phrases').find({word: word, user: user}).toArray(function (err, result) {
      if (!err) {
        result = result.filter(function (phrase) {
          if (phrase.phrase == '[DELETED]') {
            return false;
          } else {
            return true;
          }
        });
        resolve(result);
      } else {
        reject('find phrases failed, caused by: ' + err + ", input:" + word + ", " + user);
      }
    })
  });
}

function add_word(user, date, word) {
  let first = new Date(date);
  let interval = 14 * 24 * 3600 * 1000; // Based on the book 词行天下, we are going to use equivalent interval
  let word1 = {
    user: user,
    word: word,
    date: moment(first).format('YYYY-MM-DD'),
    memory: 1,
    example: '',
    completion: false
  };
  let word2 = {
    user: user,
    word: word,
    date: moment(first.getTime() + interval).format('YYYY-MM-DD'),
    memory: 2,
    example: '',
    completion: false
  };
  let word3 = {
    user: user,
    word: word,
    date: moment(first.getTime() + 2 * interval).format('YYYY-MM-DD'),
    memory: 3,
    example: '',
    completion: false
  };
  let word4 = {
    user: user,
    word: word,
    date: moment(first.getTime() + 3 * interval).format('YYYY-MM-DD'),
    memory: 4,
    example: '',
    completion: false
  };
  let word5 = {
    user: user,
    word: word,
    date: moment(first.getTime() + 4 * interval).format('YYYY-MM-DD'),
    memory: 5,
    example: '',
    completion: false
  };
  let word6 = {
    user: user,
    word: word,
    date: moment(first.getTime() + 5 * interval).format('YYYY-MM-DD'),
    memory: 6,
    example: '',
    completion: false
  };
  let word7 = {
    user: user,
    word: word,
    date: moment(first.getTime() + 6 * interval).format('YYYY-MM-DD'),
    memory: 7,
    example: '',
    completion: false
  };

  return Promise.all([insert_word(word1), insert_word(word2), insert_word(word3), insert_word(word4), insert_word(word5), insert_word(word6), insert_word(word7)]);
}

exports.add_word = add_word;

function add_words(user, date, words) {
  let promises = [];
  words.forEach(function (word) {
    promises.push(add_word(user, date, word));
  });

  return Promise.all(promises);
}

exports.add_words = add_words;

function list_words(user, date) {
  return new Promise(function (resolve, reject) {
    db.collection('words').find({user: user, date: date}).toArray(function (err, words) {
      if (err) {
        reject('list_words failed, caused by: ' + err.toString());
      } else {
        resolve(words);
      }
    });
  }).then(function (words) {
    var result = {};
    result.first = [];
    result.revise = [];
    var phrases = {};
    result.phrases = phrases;

    var promises = [];
    for (let word of words) {
      if (word.memory == 1) {
        result.first.push(word);
      } else {
        result.revise.push(word);
      }

      phrases[word.word] = {};
      promises.push(findPhrasesByWord(word.word, user));
    }

    return Promise.all(promises).then(function (promiseList) {
      for (let promiseReturn of promiseList) {
        for (let phraseRow of promiseReturn) {
          phrases[phraseRow.word][phraseRow._id] = phraseRow.phrase;
        }

      }
      return result;
    });
  });
}

exports.list_words = list_words;

function update_words(user, date, words) {
  let promises = [];

  words.first.forEach(function (word) {
    word.user = user;
    word.date = date;

    promises.push(update_word(word));
  });

  words.revise.forEach(function (word) {
    word.user = user;
    word.date = date;

    promises.push(update_word(word));
  });

  return Promise.all(promises);
}

exports.update_words = update_words;


exports.updateWord = update_word;
function update_word(word) {
  return new Promise(function (resolve, reject) {
    let id = word._id;
    delete word._id;
    db.collection('words').updateOne({_id: ObjectID(id)}, {$set: word}, function (err, result) {
      if (err) {
        reject('update_word failed, caused by: ' + err.toString());
      } else {
        resolve(result);
      }
    });
  });
}
