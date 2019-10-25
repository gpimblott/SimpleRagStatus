'use strict';

const logger = require('../winstonLogger')(module);
const reportDao = require("../dao/reportDAO");
const projectStatusDao = require("../dao/projectStatusDAO");
const Excel = require('exceljs');

const columns = [
    { header:'Project Code', key:'code', width:'20'},
    { header: 'Service/Team', key:'project_name', width: 50 },
    { header: 'Schedule', key:'schedule', width:10},
    { header: 'Scope', key:'scope', width:10},
    { header: 'Risk', key:'risk', width:10},
    { header: 'Highlights/Lowlights', key:'description' ,width: 100 }
];

const ExcelReport = class {

    constructor () {

    }

    createExcelReport (reportId) {

        return projectStatusDao.getStatusReportByReportId(reportId)
            .then(ragReport => {

                let workbook = new Excel.Workbook();
                workbook.creator = 'RAG-e';
                //workbook.lastModifiedBy = 'Her';
                workbook.created = new Date();
                // workbook.modified = new Date();
                // workbook.lastPrinted = new Date(2016, 9, 27);

                let sheet = workbook.addWorksheet('RAG Report');
                sheet.columns = columns;

                ragReport.forEach(report => {
                    console.log(report);
                    let row = sheet.addRow(report);
                    row.commit();
                });
                //sheet.commit();
                //workbook.commit();
                this.colourRows( sheet );

                workbook.xlsx.writeFile("test.xlsx")
                    .then(() => {
                        logger.info("Excel file written");
                    });
                return true;
            })
            .catch(error => {
                logger.error("Something went wrong writing excel file : %s", error);
                return false;
            });
    };

    colourRows( worksheet ) {
        worksheet.eachRow ( (row, rowNumber) => {
            console.log('Row ' +rowNumber + '=' + JSON.stringify(row.values))
        })
    }

}

export default ExcelReport;