'use strict';

var moment = require('./moment');

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();
    var band = JSON.parse(json);
    var busyTime = [];
    for (var i in band) {
        band[i].forEach(function (time) {
            var busyTimeFrom = getMinutes(time.from.split(' '));
            var busyTimeTo = getMinutes(time.to.split(' '));
            busyTime.push({from: busyTimeFrom,
                           to: busyTimeTo,
                           day: time.from.split(' ')[0]});
        });
    }
    var workingMinutes = [];
    for (var i = 0; i < 3; i++) {
        var workingTimeFrom = getWorkingTime(workingHours.from, i);
        var workingTimeTo = getWorkingTime(workingHours.to, i);
        var day;
        Object.keys(days).forEach(function (key) {
            if (days[key] === i) {
                day = key;
                return;
            }
        });
        workingMinutes.push({from: workingTimeFrom,
                            to: workingTimeTo,
                            day: day });
    }
    busyTime.sort(function (a, b) {
        return a.from < b.from ? -1 : 1;
    });
    var moments = getMoment(busyTime, minDuration, workingMinutes);
    appropriateMoment.date = setAppropriateDay(moments.to, workingHours.from);
    // 1. Читаем json
    // 2. Находим подходящий ближайший момент начала ограбления
    // 3. И записываем в appropriateMoment
    return appropriateMoment;
};

// Возвращает статус ограбления (этот метод уже готов!)
module.exports.getStatus = function (moment, robberyMoment) {
    if (moment.date < robberyMoment.date) {
        // «До ограбления остался 1 день 6 часов 59 минут»
        return robberyMoment.fromMoment(moment);
    }

    return 'Ограбление уже идёт!';
};

var days = { 'ПН': 0, 'ВТ': 1, 'СР': 2 };
function setAppropriateDay(time, workingHours) {
    if (workingHours.indexOf('+') !== -1) {
        var timezone = Number(workingHours.split(/([+-])/)[2]) * 60;
        time = time + timezone;
    } else if (workingHours.indexOf('-') !== -1) {
        var timezone = Number(workingHours.split(/([+-])/)[2]) * 60;
        time = time - timezone;
    }
    var day = Math.floor(time / (60 * 24));
    time -= 60 * 24 * day;
    var hour = Math.floor(time / 60);
    time -= 60 * hour;
    Object.keys(days).forEach(function (someDay) {
        if (days[someDay] === day) {
            day = someDay;
        }
    });
    return {day: day,
            hours: hour,
            minutes: time
    };
}

function getMinutes(time) {
    var hours = time[1].split(/([+-])/)[0];
    var busyHours = Number(hours.slice(0, hours.indexOf(':')));
    var busyMinutes = Number(hours.slice(hours.indexOf(':') + 1,
                                        hours.indexOf(':') + 3));
    var busyTime = days[time[0]] * 24 * 60 + busyHours * 60 + busyMinutes;
    if (time[1].indexOf('+') !== -1) {
        var timezone = Number(time[1].split(/([+-])/)[2]) * 60;
        busyTime = busyTime - timezone;
    } else if (time[1].indexOf('-') !== -1) {
        var timezone = Number(time[1].split(/([+-])/)[2]) * 60;
        busyTime = busyTime + timezone;
    }
    return busyTime;
}

function getWorkingTime(time, day) {
    var workHours = Number(time.slice(0, time.indexOf(':')));
    var workMinutes = Number(time.slice(time.indexOf(':') + 1,
                                        time.indexOf(':') + 3));
    var workingTime = day * 24 * 60 + workHours * 60 + workMinutes;
    if (time.indexOf('+') !== -1) {
        var timezone = Number(time.split(/([+-])/)[2]) * 60;
        workingTime = workingTime - timezone;
    } else if (time.indexOf('-') !== -1) {
        var timezone = Number(time.split(/([+-])/)[2]) * 60;
        workingTime = workingTime + timezone;
    }
    return workingTime;
}

function getMoment(time, duration, workingHours) {
    for (var i = 0; i < time.length - 1; i++) {
        if (time[i].to + duration <= time[i + 1].from) {
            for (var j = 0; j < workingHours.length; j++) {
                if (time[i].day === workingHours[j].day &&
                    time[i].to + duration <= workingHours[j].to &&
                    time[i].to >= workingHours[j].from) {
                    return time[i];
                }
            }
        }
    }
}
