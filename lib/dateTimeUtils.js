'use strict';

let DateTimeUtils = function () {};

DateTimeUtils.DDMM_Time = function (date) {

    let month = date.getUTCMonth()+1;
    let day = date.getUTCDate()
    let hrs = date.getUTCHours();
    let minute = date.getUTCMinutes();

    if( hrs < 10 ) hrs = '0' + hrs;
    if( minute < 10) minute = '0' + minute;

    return day + "/" + month  + "  " + hrs + ":" + minute;
}

DateTimeUtils.DDMMYY_Time = function (date) {

    let year = date.getFullYear();
    let month = date.getUTCMonth()+1;
    let day = date.getUTCDate()
    let hrs = date.getUTCHours();
    let minute = date.getUTCMinutes();

    if( hrs < 10 ) hrs = '0' + hrs;
    if( minute < 10) minute = '0' + minute;

    return day + "/" + month + "/" + year + "  " + hrs + ":" + minute + " UTC";
}

DateTimeUtils.DDMMYY = function (date) {

    let year = date.getFullYear();
    let month = date.getUTCMonth()+1;
    let day = date.getUTCDate();

    if( month < 10 ) month = '0' + month;
    if( day < 10 ) day = '0' + day;

    return day + "-" + month + "-" + year;
}

DateTimeUtils.formatLinkDate = function (date) {

    let year = date.getFullYear();
    let month = date.getUTCMonth()+1;
    let day = date.getUTCDate();

    if( month < 10 ) month = '0' + month;
    if( day < 10 ) day = '0' + day;

    return year + "-" + month + "-" + day;
}

DateTimeUtils.getTimestamp = function (dateString) {
    let d = new Date(dateString);
    return d.getTime();
}

DateTimeUtils.Local_DateTime = function (date) {
    let format = "%Y-%m-%d %H:%M:%S";

    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let day = date.getDate()
    let hrs = date.getHours();
    let minute = date.getMinutes();

    if( month < 10 ) month = '0' + month;
    if( day < 10 ) day = '0' + day;
    if( hrs < 10 ) hrs = '0' + hrs;
    if( minute < 10 ) minute = '0' + minute;

    return day + "-" + month + "-" + year + " " + hrs + ":" + minute;
}

DateTimeUtils.Local_Date = function (date) {
    let format = "%Y-%m-%d";

    let year = date.getFullYear();
    let month = date.getMonth()+1;
    let day = date.getDate();

    if( month < 10 ) month = '0' + month;
    if( day < 10 ) day = '0' + day;

    return day + "-" + month + "-" + year;
}

module.exports = DateTimeUtils;