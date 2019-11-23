import { describe } from 'mocha'

import ExcelReport from '../lib/generateExcel';

let assert = require('assert');

describe('Reports', function () {
    describe('WriteExcelFile', function () {

        it('should write an excel file to the file system', function () {
            let generator = new ExcelReport();
            return generator.createExcelReport(3, 'test.xlsx')
                .then(workbook => {
                    assert( workbook.getWorksheet(1).rowCount > 0, "Empty workbook returned");
                });
        });

    });
});