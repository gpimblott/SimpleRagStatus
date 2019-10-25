const mocha = require('mocha');

import ExcelReport from '../lib/generateExcel';

let assert = require('assert');

describe('Reports', function () {
    describe('WriteExcelFile', function () {

        it('should write an excel file to the file system', function ()  {
            let generator = new ExcelReport();
            return generator.createExcelReport(3);
        });

    });
});