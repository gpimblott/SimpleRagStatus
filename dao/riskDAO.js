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
            `SELECT pr.*, p.name as project_name
             FROM project_risk pr
             JOIN project p ON pr.project_id = p.id
             WHERE pr.is_closed = false
             ORDER BY date_added desc`,
        [])
};
/**
 * Get project details for the specified ID
 * @param id ID of the project
 * @returns {Promise | Promise<unknown>}
 */
RiskDAO.getRiskByProjectId = function (id) {
    return database.query(
            `SELECT pr.*
             FROM project_risk pr
             WHERE project_id = $1
             ORDER BY is_closed asc, date_added desc`,
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
                                       likelihood, impact, severity,
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
             SET likelihood=$2,
                 impact=$3,
                 severity=$4,
                 risk=$5,
                 mitigating_action=$6,
                 is_closed=$7
             WHERE id = $1`,
        [riskId, risk.likelihood, risk.impact, risk.severity,
            risk.description, risk.mitigation, is_closed]
    )
}

module.exports = RiskDAO;