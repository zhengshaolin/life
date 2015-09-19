"use strict";

var ObjectID = require('mongodb').ObjectID;

var db = null;

var moment = require('moment');

exports.bind_db = function (dbToBind) {
    db = dbToBind;
};

// 日期生成状态表增和查
function set_generated_day(user, date) {
    return new Promise(function (resolve, reject) {
        db.collection('days').insert({user: user, date: date, retrospect: ''}, function (err, day) {
            if (err) {
                reject('generate_day failed, caused by: ' + err.toString());
            } else {
                resolve(day);
            }
        });
    });
}

function is_generated_day(user, date) {
    return new Promise(function (resolve, reject) {
        db.collection('days').findOne({user: user, date: date}, function (err, day) {
            if (err) {
                reject('is_generated_day failed, caused by: ' + err.toString());
            } else {
                if (day) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    });
}

function get_day(user, date) {
    return new Promise(function (resolve, reject) {
        db.collection('days').findOne({user: user, date: date}, function (err, day) {
            if (err) {
                reject('get_day failed, caused by: ' + err.toString())
            } else {
                if (day) {
                    resolve(day);
                } else {
                    resolve('');
                }
            }
        })
    });
}

exports.get_day = get_day;

function set_day(user, date, retrospect) {
    return new Promise(function (resolve, reject) {
        db.collection('days').updateOne({user: user, date: date}, {retrospect: retrospect}, function (err, day) {
            if (err) {
                reject('set_day failed, caused by: ' + err.toString());
            } else {
                resolve(day);
            }
        });
    });
}

exports.set_day = set_day;

// 获取某一天的计划
// 1.如果该天生成过，直接返回该天对应的全部真正事件
// 2.如果该天没生成过，则生成
// 2.1.读取该天对应的日计划和周计划中的计划事件，并生成真正的事件
// 2.2.读取该天创建过的真正事件
// 2.3.返回全部真正事件
function get_schedule(user, date) {
    return new Promise(function (resolve, reject) {
        is_generated_day(user, date).then(function (generated) {
            if (generated) {
                return get_events(user, date);
            } else {
                return generate_schedule(user, date);
            }
        }).then(function (events) {
            events.sort(function (event1, event2) {
                return event1.time - event2.time;
            });
            resolve(events);
        }).catch(function (err) {
            reject('get_schedule failed, caused by: ' + err.toString());
        });
    });
}

exports.get_schedule = get_schedule;

// 生成某一天的计划
function generate_schedule(user, date) {
    return new Promise(function (resolve, reject) {
        var generatedEvents = [];
        Promise.all([generate_schedule_from_daily(user, date), generate_schedule_from_weekly(user, date)]).then(function (events) {
            generatedEvents = generatedEvents.concat(events[0], events[1]);
            if (generatedEvents.length > 0) {
                return Promise.all([set_generated_day(user, date), set_events(generatedEvents)]);
            } else {
                return set_generated_day(user, date);
            }
        }).then(function () {
            return get_events(user, date);
        }).then(function (events) {
            resolve(events);
        }).catch(function (err) {
            reject('generate_schedule failed, caused by: ' + err.toString());
        });
    });
}

function generate_schedule_from_daily(user, date) {
    return new Promise(function (resolve, reject) {
        get_daily_plan(user).then(function (plan) {
            if (plan) {
                resolve(plan.events.map(function (event) {
                    event.user = user;
                    event.begin = date;
                    event.completion = "0";
                    return event;
                }));
            } else {
                resolve([]);
            }
        }).catch(function (err) {
            reject('generate_schedule_from_daily failed, caused by: ' + err.toString());
        });
    });
}

function generate_schedule_from_weekly(user, date) {
    return new Promise(function (resolve, reject) {
        get_weekly_plan(user).then(function (plan) {
            if (plan) {
                resolve(plan.weekdays[new Date(date).getDay()].map(function (event) {
                    event.user = user;
                    event.begin = date;
                    event.completion = 0;
                    return event;
                }));
            } else {
                resolve([]);
            }
        }).catch(function (err) {
            reject('generate_schedule_from_weekly failed, caused by: ' + err.toString());
        });
    });
}

// 设置有两类，一类有id，应该更新，一类无id，需要新增
function set_schedule(user, date, events) {
    let updates = [];
    for (let event of events) {
        if (event.hasOwnProperty("_id")) {
            updates.push(update_event(event));
        } else {
            updates.push(insert_event(event));
        }
    }
    return Promise.all(updates);
}

exports.set_schedule = set_schedule;

function update_event(event) {
    return new Promise(function (resolve, reject) {
        let id = ObjectID(event._id);
        delete event._id;
        db.collection('events').updateOne({_id: id}, event, function (err, result) {
            if (err) {
                reject('update_event failed, caused by: ' + err.toString());
            } else {
                resolve(result);
            }
        });
    });
}

function insert_event(event) {
    return new Promise(function (resolve, reject) {
        db.collection('events').insert(event, function (err, result) {
            if (err) {
                reject('insert_event failed, caused by: ' + err.toString());
            } else {
                resolve(result);
            }
        });
    });
}

function get_daily_plan(user) {
    return new Promise(function (resolve, reject) {
        db.collection('plans').findOne({user: user, type: 'daily'}, function (err, plan) {
            if (err) {
                reject('get_daily_plan failed, caused by: ' + err.toString());
            } else {
                if (plan) {
                    delete plan._id;
                    plan.events.sort(function (event1, event2) {
                        return event1.time - event2.time;
                    });
                    resolve(plan);
                } else {
                    resolve({user: user, type: 'daily', events: []});
                }
            }
        });
    });
}

exports.get_daily_plan = get_daily_plan;

function set_daily_plan(user, plan) {
    return new Promise(function (resolve, reject) {
        db.collection('plans').updateOne({user: user, type: 'daily'}, plan, {upsert: true}, function (err, result) {
            if (err) {
                reject('set_daily_plan failed, caused by: ' + err.toString());
            } else {
                resolve(result);
            }
        });
    });
}

exports.set_daily_plan = set_daily_plan;

function get_weekly_plan(user) {
    return new Promise(function (resolve, reject) {
        db.collection('plans').findOne({user: user, type: 'weekly'}, function (err, plan) {
            if (err) {
                reject('get_weekly_plan failed, caused by: ' + err.toString());
            } else {
                if (plan) {
                    delete plan._id;
                    resolve(plan);
                } else {
                    resolve({user: user, type: 'weekly', weekdays: [[], [], [], [], [], [], []]});
                }
            }
        });
    });
}

exports.get_weekly_plan = get_weekly_plan;

function set_weekly_plan(user, plan) {
    console.log(user, plan);
    return new Promise(function (resolve, reject) {
        db.collection('plans').updateOne({user: user, type: 'weekly'}, plan, {upsert: true}, function (err, result) {
            if (err) {
                reject('set_weekly_plan failed, caused by: ', err.toString());
            } else {
                resolve(result);
            }
        });
    });
}

exports.set_weekly_plan = set_weekly_plan;

// 读取某一天的事件
function get_events(user, date) {
    return new Promise(function (resolve, reject) {
        db.collection('events').find({user: user, begin: date}).toArray(function (err, events) {
            if (err) {
                reject('get_events failed, caused by: ' + err.toString());
            } else {
                resolve(events);
            }
        });
    });
}

// 保存一组事件
function set_events(events) {
    return new Promise(function (resolve, reject) {
        db.collection('events').insertMany(events, function (err, result) {
            if (err) {
                reject('set_events failed, caused by: ' + err.toString());
            } else {
                resolve(result);
            }
        });
    });
}