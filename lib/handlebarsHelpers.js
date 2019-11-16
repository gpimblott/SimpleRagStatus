'use strict';
const logger = require('../winstonLogger')(module);

const Handlebars = require('handlebars');
const dateUtils = require('./dateTimeUtils');
/**
 * Helper functions for Handlebars
 */

exports.nl2br = function (text, isXhtml) {
    var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br />' : '<br>';
    return (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
};

exports.encode = function (context, str) {
    let uri = context || str;
    return new Handlebars.SafeString(encodeURIComponent(uri));
};

exports.formatDateTime = function (date) {
    return dateUtils.Local_DateTime(new Date(date));
};

exports.formatDate = function (date) {
    return dateUtils.Local_Date(new Date(date));
};

exports.formatLinkDate = function (date) {
    return dateUtils.formatLinkDate(new Date(date));
}

exports.directionArrow = function( current, previous ) {
    let classText = "fas fa-arrow";
    let important = false;

    // Having no arrow was confusing so default to 'no change'
    if (current===null){
        return "";
    }
    else if( previous===null) {
        return classText + "-right";
    }

    important = (current==='Red' && previous==='Green') || (current==='Green' && previous==='Red');

    classText += ((important) ? "-circle-" : "-");

    if( current === previous) {
        classText += "right";
    } else if( current==='Red') {
        classText += "up";
    } else if (current==='Green') {
        classText += "down";
    } else if (current==='Amber') {
        if( previous==='Red'){
            classText += "down";
        } else {
            classText += "up";
        }
    }
    else {
        logger.info ("Unknown array %s,%s", current, previous);
    }

    if(important) {
        classText += " bigChange";
    }


    return classText;
}

exports.breaklines = function(text) {
    text = Handlebars.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new Handlebars.SafeString(text);
};

exports.ifCond = function (v1, operator, v2, options) {
    switch (operator) {
        case "==":
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case "===":
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case "!=":
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case "!==":
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case "<":
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case "<=":
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case ">":
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case ">=":
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case "&&":
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case "||":
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
};
