'use strict';

module.exports = function () {
    return {
        // Здесь как-то хранится дата ;)
        date: null,

        // А здесь часовой пояс
        timezone: null,

        // Выводит дату в переданном формате
        format: function (pattern) {
            var result = pattern.replace('%DD', this.date.day);
            result = result.replace('%HH', setTime(this.date.hours + this.timezone));
            return result.replace('%MM', setTime(this.date.minutes));
        },
        // Возвращает кол-во времени между текущей датой и переданной `moment`
        // в человекопонятном виде
        fromMoment: function (moment) {
            if (moment.date.indexOf('+') !== -1) {
                var momentTimezone = Number(moment.date.split(/([+-])/)[2]);
                this.timezone = this.timezone - momentTimezone;
            } else if (moment.date.indexOf('-') !== -1) {
                var momentTimezone = Number(moment.date.split(/([+-])/)[2]);
                this.timezone = this.timezone + momentTimezone;
            }
            var splitMoment = moment.date.split(/([ ])/);
            var splitTime = splitMoment[2].split(/([:])/);
            var momentDay = days[splitMoment[0]] * 60 * 24;
            var momentHours = Number(splitTime[0]) * 60;
            var momentMinutes = momentDay + momentHours + Number(splitTime[2].split(/([+-])/)[0]);
            var minutes = days[this.date.day] * 60 * 24 + this.date.hours * 60 + this.date.minutes;
            var remainedTime = getDate(minutes - momentMinutes);
            var prefix = 'До ограбления остался ';
            var day = remainedTime.day;
            var hours = remainedTime.hours;
            var minute = remainedTime.minutes;
            return prefix + day + ' день ' + hours + ' часов ' + minute + ' минут';
        }
    };
};
var days = { 'ПН': 0, 'ВТ': 1, 'СР': 2 };
function setTime(time) {
    if (time < 10) {
        return '0' + time;
    }
    return time;
}

function getDate(time) {
    var day = Math.floor(time / (60 * 24));
    time -= 60 * 24 * day;
    var hour = Math.floor(time / 60);
    time -= 60 * hour;
    return {day: day,
            hours: hour,
            minutes: time
    };
}
