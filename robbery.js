'use strict';

var moment = require('./moment');

// Выбирает подходящий ближайший момент начала ограбления
module.exports.getAppropriateMoment = function (json, minDuration, workingHours) {
    var appropriateMoment = moment();
    var band = JSON.parse(json);
    var busyTime = [];
    for (var i in band) {
        band[i].forEach(function (time) {
            var busyTimeFrom = getMinutes(time.from.split(" "));
            var busyTimeTo = getMinutes(time.to.split(" "));
            busyTime.push({'from': busyTimeFrom,
                            'to': busyTimeTo,
                            'day': time.from.split(" ")[0]});
        });
    }
    var workingMinutes = [];
    for (var i = 1; i < 4; i++) {
        var workingTimeFrom = getWorkingTime(workingHours.from, i);
        var workingTimeTo = getWorkingTime(workingHours.to, i);
        var day;
        Object.keys(days).forEach(function (key) {
            if (days[key] === i) {
                day = key;
                return;
            }
        });      
        workingMinutes.push({'from': workingTimeFrom,
                            'to': workingTimeTo,
                            'day': day });
    }
    appropriateMoment.date = getMoment(busyTime, minDuration, workingMinutes);
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

var days = { 'ПН': 1, 'ВТ': 2, 'СР': 3 };
function getMinutes(time) {
    var hours = time[1].split(/([+-])/)[0];
    var busyHours = Number(hours.slice(0,hours.indexOf(':')));
    var busyMinutes = Number(hours.slice(hours.indexOf(':') + 1,
                                        hours.indexOf(':') + 3));
    var busyTime = days[time[0]] * 24 * 60 + busyHours * 60 + busyMinutes;
    if (time[1].indexOf("+") !== -1) {
        var timezone = Number(time[1].split(/([+-])/)[2]) * 60;
        busyTime = busyTime + timezone;
    } else if (time[1].indexOf("-") !== -1) {
        var timezone = Number(time[1].split(/([+-])/)[2]) * 60;
        busyTime = busyTime - timezone;
    }
    return busyTime;
}

function getWorkingTime(time, day) {
    var workHours = Number(time.slice(0,time.indexOf(':')));
    var workMinutes = Number(time.slice(time.indexOf(':') + 1,
                                        time.indexOf(':') + 3));
    var workingTime = day * 24 * 60 + workHours * 60 + workMinutes;
    if (time.indexOf("+") !== -1) {
        var timezone = Number(time.split(/([+-])/)[2]) * 60;
        workingTime = workingTime + timezone;
    } else if (time.indexOf("-") !== -1) {
        var timezone = Number(time.split(/([+-])/)[2]) * 60;
        workingTime = workingTime - timezone;
    }
    return workingTime;
}
function getMoment(time, duration, workingHours) {
    for (var i=0; i < time.length - 1; i++) {
        if (time[i].to + duration < time[i+1].from) {
            if (time[i].day === workingHours.day && 
            time[i+1].from <= workingHours.to && 
            time[i].to >= workingHours.from) {
            return time;
            }
        }
    }
 }
//function getCorrectDate(time) {
    
//}
