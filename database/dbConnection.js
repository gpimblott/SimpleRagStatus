'use strict';

const logger = require('../winstonLogger')(module);
const Url = require('url');
const pg = require('pg');

/**
 * Standard code for connecting to a database
 */
class DBConnection {

    constructor () {
        pg.defaults.poolSize = 20;

        const config = DBConnection.getConnectionConfig();

        logger.info('creating db pool');
        this._pool = new pg.Pool(config);

        this._pool.on('error', function (err, client) {
            logger.error("Database Pool Error : %s", err);
        });
    }

    /**
     * Perform a select query operation
     * @param sql Statement to perform
     * @param parameters Parameters for the query
     * @param done Function to call on success
     * @param error Function to call on error
     */
    query (sql, parameters) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._pool.query(sql, parameters, (err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res.rows);
                }
            });
        });
    };

    async queryInTransaction (sqlArray, parameterArray) {
        const client = await this._pool.connect();

        let results = [];
        try {
            await client.query('BEGIN')

            let result = undefined;
            for (let index in sqlArray) {
                logger.info("executing : %s %s", sqlArray[ index ], parameterArray[ index ]);

                let parameters = parameterArray[ index ];
                if (typeof parameters === "function") {
                    parameters = parameters( result.rows );
                }

                result = await client.query(sqlArray[ index ], parameters);

                results.push(result);
            }

            await client.query('COMMIT')
        } catch (e) {
            logger.error("Execption caught ROlling back");
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release();
        }
        return results;
    };

    /**
     * Perform an insertOrUpdate operation on the database
     * @param sql Statement to perform
     * @param parameters Parameters for the query
     * @param done Function to call on exit
     * @param error Error function to call on error
     */
    insertOrUpdate (sql, parameters, done, error) {
        let that = this;
        return new Promise(function (resolve, reject) {
            that._pool.query(sql, parameters, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Wrapper around delete function to delete by a set of ids
     * @param tableName
     * @param ids array of IDS to delete
     * @param done function to call on completion
     */
    deleteByIds (tableName, ids, done) {

        let params = [];
        for (let i = 1; i <= ids.length; i++) {
            params.push('$' + i);
        }

        let sql = "DELETE FROM " + tableName + " WHERE id IN (" + params.join(',') + "  )";

        this.query(sql, ids)
            .then(
                (result) => {
                    done(true);
                },
                (error) => {
                    logger.error(error);
                    done(false, error);
                });

    };

    getAllFromTable (tableName, done, order) {
        let sql = "SELECT * FROM " + tableName;
        let params = [];

        if (order != null) {
            sql = sql + " ORDER BY $1";
            params.push(order);
        }

        this.query(sql, params)
            .then(
                (results) => {
                    done(results);
                },
                (error) => {
                    logger.error(error);
                    done(null);
                });
    };

    /**
     * Environments like Heroku provide a connection string, I have found this can cause problems
     * when trying to enforce SSL.  So I decode it if it exists and create a manual configuration
     * object otherwise assume that the individual environment variables are defined.
     *
     * Note : A DATABASE_URL will override individual env variables
     */
    static getConnectionConfig () {
        let connectionStr = process.env.DATABASE_URL;

        if (undefined === connectionStr) {
            logger.log("warn", "DATABASE_URL NOT found - Using individual env variables");
            let config = {
                user: process.env.PGUSER,
                password: process.env.PGPASSWORD,
                host: process.env.PGHOST,
                port: process.env.PGPORT,
                database: process.env.PGDATABASE,
                sslmode: 'require'
            };

            return config;
        } else {
            logger.info(  "DATABASE_URL found")
            let params = Url.parse(connectionStr);
            let auth = params.auth.split(':');
            let config = {
                user: auth[ 0 ],
                password: auth[ 1 ],
                host: params.hostname,
                port: params.port,
                database: params.pathname.split('/')[ 1 ],
                ssl: true
            };

            return config;
        }
    }

    static isInt (value) {
        return !isNaN(value) &&
            parseInt(Number(value)) == value &&
            !isNaN(parseInt(value, 10));
    };

}

const instance = new DBConnection();
Object.freeze(instance);

module.exports = instance;