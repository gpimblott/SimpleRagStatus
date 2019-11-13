'use strict';

const logger = require('../winstonLogger')(module);
const reportDao = require("../dao/reportDAO");
const projectStatusDao = require("../dao/projectStatusDAO");
const Excel = require('exceljs');

const columns = [
    { header: 'Project Code', key: 'code', width: '20' },
    { header: 'Service/Team', key: 'project_name', width: 50 },
    { header: 'Benefit', key: 'benefits', width: 10 },
    { header: 'Schedule', key: 'schedule', width: 10 },
    { header: 'Scope', key: 'scope', width: 10 },
    { header: 'Risk', key: 'risk', width: 10 },
    { header: 'Benefits update', key: 'benefits_text', width: 50},
    { header: 'Schedule update', key: 'schedule_text', width: 50},
    { header: 'Scope update', key: 'scope_text', width: 50},
    { header: 'Risk update', key: 'risk_text', width: 50}
];

const headingFontStyle = {
    name: 'Calibri',
    family: 4,
    size: 14,
    underline: false,
    bold: true
};

const headingFillStyle = {
    'type': 'pattern',
    'pattern': 'solid',
    'fgColor': { argb: 'FFDCDCDC' },
    'bgColor': { argb: 'FFFFFFFF' }
};

const greenStyle = {
    'type': 'pattern',
    'pattern': 'solid',
    'fgColor': { argb: 'FF90EE90' },
    'bgColor': { argb: 'FFFFFFFF' }
};

const redStyle = {
    'type': 'pattern',
    'pattern': 'solid',
    'fgColor': { argb: 'FFFF9580' },
    'bgColor': { argb: 'FFFFFFFF' }
};

const amberStyle = {
    'type': 'pattern',
    'pattern': 'solid',
    'fgColor': { argb: 'BBFFBF00' },
    'bgColor': { argb: 'FFFFFFFF' }
};

/**
 * Class responsible for creating the Excel Spreadsheet
 * @type {ExcelReport}
 */
const ExcelReport = class {

    constructor () {
        this.workbook = new Excel.Workbook();
    }

    createExcelReport (reportId) {

        return reportDao.getReportById(reportId)
            .then(report => {
                return projectStatusDao.getFullStatusReportByReportId(reportId);
            })
            .then(ragReport => {
                this.workbook.creator = 'RAG-e';
                this.workbook.created = new Date();

                let sheet = this.workbook.addWorksheet('Team RAG');
                sheet.columns = columns;

                ragReport.forEach(report => {
                    let row = sheet.addRow(report);
                    row.commit();
                });

                this.colourRows(sheet);
                return this.workbook;
            })
            .catch(error => {
                logger.error("Error occurred geneating spreadsheet : %s", error);
            });
    };

    saveWorkbookAsFile (filename) {
        return this.workbook.xlsx.writeFile(filename);
    }

    saveWorkbookToStream (stream) {
        return this.workbook.xlsx.write(stream);
    }

    /**
     * Colour in the RAG cells to match their colour names
     * @param worksheet
     */
    colourRows (worksheet) {

        // set the title / heading style
        worksheet.getRow(1).font = headingFontStyle;
        worksheet.getRow(1).fill = headingFillStyle;

        worksheet.spliceRows(1, 0, {})

        // Colour the RAG cells
        worksheet.eachRow((row, rowNumber) => {

            for (let x = 3; x < 7; x++) {
                let value = row.getCell(x).value;
                if (value === 'Green') {
                    row.getCell(x).fill = greenStyle;
                } else if (value === 'Red') {
                    row.getCell(x).fill = redStyle;
                } else if (value === 'Amber') {
                    row.getCell(x).fill = amberStyle;
                }
            }
        })
    }
}

export default ExcelReport;