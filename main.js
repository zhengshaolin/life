"use strict";

/**
 * 核心数据结构：
 * 每件规划要做的事：events
 * event: {
 *     user: 'K', // 所属用户名
 *     begin: 2015-09-10, // 最初计划本事项开始的事件
 *     type: '投资', // 类型，投资，事业，琐事
 *     affair: '跑步5.1KM', // 什么事
 *     objective: '锻炼身体，振兴中华', // 目标，为什么要做这事
 *     checkpoint: '事前热身，事后放松，呼吸有序', // 检查点，做这件事的关键要点
 *     time: 1400, // 开始时间点
 *     duration: 1.5, // 持续时间（小时）
 *     retrospect: '没有热身，导致脚伤', // 总结
 *     completion: 100, // 完成度，百分比
 * }
 *
 * 每日计划：plans
 * daily_plan: {
 *     user: 'K', // 用户
 *     type: 'daily',
 *     events: [] // 计划中的事项清单，和正常event比没有用户，完成度和总结
 * }
 *
 * 每周计划：plans
 * weekly_plan: {
 *     user: 'K', // 用户
 *     type: 'weekly',
 *     weekdays: [ // 每天一组计划，与Date.getDay()对应
 *         events: [], // 周日计划
 *         events: [], // 周一计划
 *         events: [], // 周二计划
 *         events: [], // 周三计划
 *         events: [], // 周四计划
 *         events: [], // 周五计划
 *         events: [] // 周六计划
 *     ]
 * }
 *
 * 每日生成状态表：days
 * days: {
 *     user: 'K',
 *     date: 2015-09-12,
 *     restrospect: '' // 每日回顾总结
 * }
 *
 * 工作池子：pools
 * pools: {
 *     user: 'K',
 *     events: [
 *         {priority: "1000", type, affair, objective, checkpoint},
 *     ]
 * }
 *
 */

var Crypto = require('crypto');
var Mongodb = require('mongodb');
var ObjectID = require('mongodb').ObjectID;

var moment = require('moment');

//var Qrcode = require('qrcode');

var Life = require('./life.js');
var English = require('./english.js');

var phraseRouter = require('./routes/phrase');

var server = new Mongodb.Server('mongo', 27017, {auto_reconnect: true});
var database = new Mongodb.Db('life', server, {safe: true});
var db;
database.open(function (err, mongo) {
  if (!err) {
    console.log('life database connected');
    db = mongo;
    Life.bind_db(mongo);
    English.bind_db(mongo);
  } else {
    console.log('life database unreachable: ' + err);
  }
});

var Express = require('express');
var BodyParser = require('body-parser');
var CookieParser = require('cookie-parser');

var app = Express();

app.use(CookieParser());

// 配置BODY数据解析器
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({extended: true, limit: '1000kb'}));

// 配置静态目录
app.use('/public', Express.static('dist/'));

app.use('/', phraseRouter);

app.use(function (req, res, next) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "*");
  res.set("Access-Control-Allow-Headers", "token,Content-Type");

  if (req.method == 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.path.startsWith('/token')) {
    next();
    return;
  }

  if (req.path == '/favicon.ico') {
    next();
    return;
  }

  if ("token" in req.headers) {
    next();
    return;
  }

  res.status(401).end();
});

// 登录
app.get('/token', function (req, res) {
  get_user(req.query.username, req.query.password).then(function (user) {
    let signature = Crypto.createHash('md5').update(user.username + 'LIFE').digest('hex');
    return user.username + '-' + signature;
  }).then(function (token) {
    res.json({token: token});
  }).catch(function (err) {
    console.log(err);
    res.status(500).end(err.toString());
  });
});

// 读取指定日期的总结
app.get('/retrospect/:date', function (req, res) {
  let token = req.headers.token;
  let date = req.params.date;

  verify_token(token).then(function (user) {
    return Life.get_day(user, date);
  }).then(function (day) {
    res.json(day);
  }).catch(function (err) {
    console.log(err);
    res.status(500).end(err.toString());
  });
});

// 读取其他人指定日期的总结
app.get('/retrospect/:date/show/:other', function (req, res) {
  let token = req.headers.token;
  let other = req.params.other;
  let date = req.params.date;

  verify_token(token).then(function (user) {
    return Life.get_day(other, date);
  }).then(function (day) {
    res.json(day);
  }).catch(function (err) {
    console.log(err);
    res.status(500).end(err.toString());
  });
});

// 设置指定日期的总结
app.put('/retrospect/:date', function (req, res) {
  let token = req.headers.token;
  let date = req.params.date;

  verify_token(token).then(function (user) {
    return Life.set_day(user, date, req.body.retrospect);
  }).then(function (day) {
    res.json(day);
  }).catch(function (err) {
    console.log(err);
    res.status(500).end(err.toString());
  });
});

// 读取指定日期的计划
app.get('/schedule/:date', function (req, res) {
  let token = req.headers.token;
  let date = req.params.date;

  verify_token(token).then(function (user) {
    return Life.get_schedule(user, date);
  }).then(function (events) {
    res.json(events);
  }).catch(function (err) {
    console.log(err);
    res.status(500).end(err.toString());
  });
});

// 读取其他人的计划
app.get('/schedule/:date/show/:other', function (req, res) {
  let token = req.headers.token;
  let other = req.params.other;
  let date = req.params.date;

  verify_token(token).then(function (user) {
    return Life.get_schedule(other, date);
  }).then(function (events) {
    res.json(events);
  }).catch(function (err) {
    console.log(err);
    res.status(500).end(err.toString());
  });
});

// 更新指定日期的计划
app.put('/schedule/:date', function (req, res) {
  let token = req.headers.token;
  let date = req.params.date;

  verify_token(token).then(function (user) {
    return Life.set_schedule(user, date, req.body);
  }).then(function (result) {
    res.json(result);
  }).catch(function (err) {
    console.log(err);
    res.status(500).end(err.toString());
  });
});

// 读取周计划
app.get('/plan/weekly', function (req, res) {
  verify_token(req.headers.token).then(function (user) {
    return Life.get_weekly_plan(user);
  }).then(function (plan) {
    res.json(plan);
  }).catch(function (err) {
    console.log(err);
    res.status(500).end(err.toString());
  });
});

// 设置周计划
app.put('/plan/weekly', function (req, res) {
  verify_token(req.headers.token).then(function (user) {
    return Life.set_weekly_plan(user, req.body);
  }).then(function (result) {
    res.json(result);
  }).catch(function (err) {
    console.log(err);
    res.status(500).end(err.toString());
  });
});

// 读取日计划
app.get('/plan/daily', function (req, res) {
  verify_token(req.headers.token).then(function (user) {
    return Life.get_daily_plan(user);
  }).then(function (plan) {
    res.json(plan);
  }).catch(function (err) {
    console.log(err);
    res.status(500).end(err.toString());
  });
});

// 设置日计划
app.put('/plan/daily', function (req, res) {
  verify_token(req.headers.token).then(function (user) {
    return Life.set_daily_plan(user, req.body);
  }).then(function (result) {
    res.json(result);
  }).catch(function (err) {
    console.log(err);
    res.status(500).end(err.toString());
  });
});

// 读取工作池
app.get('/pool', function (req, res) {
  verify_token(req.headers.token).then(function (user) {
    return Life.get_pool(user);
  }).then(function (pool) {
    res.json(pool.events);
  }).catch(function (err) {
    console.log(err);
    res.status(500).end(err.toString());
  });
});

// 设置工作池
app.put('/pool', function (req, res) {
  verify_token(req.headers.token).then(function (user) {
    return Life.set_pool(user, req.body);
  }).then(function (result) {
    res.json(result);
  }).catch(function (err) {
    console.log(err);
    res.status(500).end(err.toString());
  });
});

// 新增单词
app.post('/words/:date', function (req, res) {
  let token = req.headers.token;
  let date = req.params.date;

  verify_token(token).then(function (user) {
    return English.add_words(user, date, req.body);
  }).then(function (result) {
    res.json(result);
  }).catch(function (err) {
    console.log(err);
    res.status(500).end(err.toString());
  });
});

// 查某日单词
app.get('/words/:date', function (req, res) {
  let token = req.headers.token;
  let date = moment(new Date(req.params.date)).format('YYYY-MM-DD');

  verify_token(token).then(function (user) {
    return English.list_words(user, date);
  }).then(function (words) {
    res.json(words);
  }).catch(function (err) {
    console.log(err);
    res.status(500).end(err.toString());
  });
});

// 更新某日单词
app.put('/words/:date', function (req, res) {
  let token = req.headers.token;
  let date = req.params.date;

  verify_token(token).then(function () {
    return English.updateWord(req.body);
  }).then(function (result) {
    res.json(result);
  }).catch(function (err) {
    console.log(err);
    res.status(500).end(err.toString());
  });
});

// 查多日单词
app.get('/words', function (req, res) {
  let token = req.headers.token;
  let dates = req.query.dates.split(',');
  let words = {};

  verify_token(token).then(function (user) {
    let promises = [];
    dates.forEach(function (date) {
      words[date] = {};
      words[date].first = [];
      words[date].revise = [];
      promises.push(English.list_words(user, date));
    });
    return Promise.all(promises);
  }).then(function (wordsList) {
    wordsList.forEach(function (wordsListForOneDay) {
      wordsListForOneDay.forEach(function (word) {
        if (word.memory == 1) {
          words[word.date].first.push(word);
        } else {
          words[word.date].revise.push(word);
        }
      });
    });
    res.json(words);
  }).catch(function (err) {
    console.log(err);
    res.status(500).end(err.toString());
  });
});

//app.get('/qrcode', function (req, res) {
//    Qrcode.toDataURL(req.query.text, function (err, url) {
//        if (err) {
//            res.status(500).end(err.toString());
//        } else {
//            res.json({dataUrl: url});
//        }
//    });
//});

app.listen(8080);

function get_user(username, password) {
  return new Promise(function (resolve, reject) {
    db.collection('users').findOne({username: username, password: password}, function (err, user) {
      if (err) {
        reject(err);
      } else {
        if (user) {
          resolve(user);
        } else {
          reject('can\'t find user');
        }
      }
    });
  });
}

function verify_token(token) {
  return new Promise(function (resolve, reject) {
    // 1.从Token里拿用户和签名
    // 2.对用户名+盐进行MD5计算签名
    // 3.签名比对
    if (token == undefined) {
      reject('invalid token');
      return;
    }

    let userAndSignature = token.split('-');
    if (userAndSignature.length == 2) {
      let user = userAndSignature[0];
      let verify = userAndSignature[1];

      if (verify == Crypto.createHash('md5').update(user + 'LIFE').digest('hex')) {
        resolve(user);
      } else {
        reject('invalid token');
      }
    } else {
      reject('invalid token');
    }
  });
}
