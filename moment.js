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
            console.log(moment);
        }
    };
};

function setTime(time) {
    if (time < 10) {
        return '0' + time;
    }
    return time;
}
