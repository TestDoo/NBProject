// script.js
// 시간 데이터를 '2020-01-01'로 출력하기 위한 js 코드

$(function () {
    function get2digits(num) {
        return ("0" + num).slice(-2);
    }

    function getDate(dateObj) {
        if (dateObj instanceof Date) return dateObj.getFullYear() + "-" + get2digits(dateObj.getMonth() + 1) + "-" + get2digits(dateObj.getDate());
    }

    function getTime(dateObj) {
        if (dateObj instanceof Date) return get2digits(dateObj.getHours()) + ":" + get2digits(dateObj.getMinutes()) + ":" + get2digits(dateObj.getSeconds());
    }

    function convertDate() {
        $("[data-date]").each(function (index, element) {
            var dateString = $(element).data("date");
            if (dateString) {
                var date = new Date(dateString);
                $(element).html(getDate(date));
            }
        });
    }

    function convertDateTime() {
        $("[data-date-time]").each(function (index, element) {
            var dateString = $(element).data("date-time");
            if (dateString) {
                var date = new Date(dateString);
                $(element).html(getDate(date) + " " + getTime(date));
            }
        });
    }

    convertDate();
    convertDateTime();
});
