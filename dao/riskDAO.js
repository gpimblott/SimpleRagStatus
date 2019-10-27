const logger = require('../winstonLogger')(module);
const database = require('../database/dbConnection.js');

const RiskDAO = function () {
};

/**
 * Get details all risks
 * @returns {Promise | Promise<unknown>}
 */
RiskDAO.getAllOpenRisks = function () {
    return database.query(
            `SELECT pr.*, rs1.name as impact, rs2.name as likelihood, rs3.name as severity, p.name as project_name
             from project_risk pr
                      JOIN rag_status rs1 on pr.impact_id = rs1.id
                      JOIN rag_status rs2 on pr.likelihood_id = rs2.id
                      JOIN rag_status rs3 on pr.severity_id = rs3.id
                      JOIN project p on pr.project_id = p.id
             where pr.is_closed = false
             order by date_added`,
        [])
};
/**
 * Get project details for the specified ID
 * @param id ID of the project
 * @returns {Promise | Promise<unknown>}
 */
RiskDAO.getRiskByProjectId = function (id) {
    return database.query(
            `SELECT pr.*, rs1.name as impact, rs2.name as likelihood, rs3.name as severity
             from project_risk pr
                      JOIN rag_status rs1 on pr.impact_id = rs1.id
                      JOIN rag_status rs2 on pr.likelihood_id = rs2.id
                      JOIN rag_status rs3 on pr.severity_id = rs3.id
             where project_id = $1
             order by is_closed asc, date_added desc`,
        [id])
};

/**
 * Get a Risk by it's id
 * @param riskId
 * @returns {Promise | Promise<unknown>}
 */
RiskDAO.getRiskById = function (riskId) {
    return database.query(`SELECT *
                           FROM project_risk
                           WHERE id = $1`, [riskId]);
}

/**
 * Add a new risk for the project
 * @param projectId
 * @param risk
 * @returns {Promise | Promise<unknown>}
 */
RiskDAO.addRisk = function (projectId, risk) {
    return database.insertOrUpdate(
            `INSERT INTO project_risk (date_added, project_id,
                                       likelihood_id, impact_id, severity_id,
                                       risk, mitigating_action, is_closed)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [risk.riskDate, projectId, risk.likelihood, risk.impact, risk.severity,
            risk.description, risk.mitigation, false]
    )
}

/**
 * update a risk
 * @param projectId
 * @param risk
 * @returns {Promise | Promise<unknown>}
 */
RiskDAO.updateRisk = function (riskId, risk) {
    let is_closed = (parseInt(risk.status)===1);

    console.log(risk);

    return database.insertOrUpdate(
            `UPDATE project_risk
             SET likelihood_id=$2,
                 impact_id=$3,
                 severity_id=$4,
                 risk=$5,
                 mitigating_action=$6,
                 is_closed=$7
             WHERE id = $1`,
        [riskId, risk.likelihood, risk.impact, risk.severity,
            risk.description, risk.mitigation, is_closed]
    )
}

module.exports = RiskDAO;