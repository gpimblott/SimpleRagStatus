'use strict';

// Import the dependencies for testing
import chai from 'chai';

import chaiHttp from 'chai-http';
import { describe } from 'mocha'
import app from '../app';

// Configure chai
chai.use(chaiHttp);
chai.should();

const userCredentials = {
    username: 'admin',
    password: 'password'
}

const badUserCredentials = {
    username: 'admin',
    password: 'badpassword'
}

describe("User needs to be authenticated to be access endpoints", () => {
    let getEndpoints = [
        '/',
        '/changeMyPassword',
        '/upload-account-csv',
        '/project', '/project/1', '/project/1/milestone', '/project/1/milestone/1',
        '/project/1/status/1',
        '/project/1/risk', '/project/1/risk',
        '/report', '/report/1',
        '/account', '/account/1', '/account/1/password',
        '/programme/dashboard','/programme/risks'
    ];

    let postEndpoints = [
        '/changeMyPassword',
        '/upload-account-csv',
        '/project', '/project/1', '/project/1/milestone', '/project/1/milestone/1',
        '/project/1/status/1', '/project/1/risk/1',
        '/report', '/report/1',
        '/account', '/account/1/password',
    ];

    let deleteEndpoints = [
        '/account/1',
        '/project/1/milestone/1',
        '/project/1',
        '/report/1'
    ];

    describe("Test GET access blocked to secure endpoints", () => {
        getEndpoints.forEach((endpoint) => {
            it(endpoint + " should be redirect to login page", (done) => {
                chai.request(app)
                    .get(endpoint)
                    .redirects(0)
                    .end((err, res) => {
                        chai.expect(err).to.be.null;
                        res.should.have.status(302);
                        chai.expect(res).to.redirect;
                        chai.expect(res).to.redirectTo('/auth/login');
                        done();
                    })
            })
        })
    });

    describe("Test POST access blocked to secure endpoints", () => {
        postEndpoints.forEach((endpoint) => {
            it(endpoint + " should be redirect to login page", (done) => {
                chai.request(app)
                    .post(endpoint)
                    .redirects(0)
                    .end((err, res) => {
                        chai.expect(err).to.be.null;
                        res.should.have.status(302);
                        chai.expect(res).to.redirect;
                        chai.expect(res).to.redirectTo('/auth/login');
                        done();
                    })
            })
        })
    });

    describe("Test DELETE access blocked to secure endpoints", () => {
        deleteEndpoints.forEach((endpoint) => {
            it(endpoint + " should be redirect to login page", (done) => {
                chai.request(app)
                    .delete(endpoint)
                    .redirects(0)
                    .end((err, res) => {
                        chai.expect(err).to.be.null;
                        res.should.have.status(302);
                        chai.expect(res).to.redirect;
                        chai.expect(res).to.redirectTo('/auth/login');
                        done();
                    })
            })
        })
    });
})

describe("login", () => {

    describe("POST /auth/login", () => {
        it("Should fail to log the user in", (done) => {
            chai.request(app)
                .post('/auth/login')
                .redirects(0)
                .send(badUserCredentials)
                .end((err, res) => {
                    chai.expect(err).to.be.null;
                    res.should.have.status(302);
                    chai.expect(res).to.redirect;
                    chai.expect(res).to.redirectTo('/auth/login');
                    done();
                })
        });
    });

    describe("POST /auth/login", () => {
        it("Should log the user in", (done) => {
            chai.request(app)
                .post('/auth/login')
                .redirects(0)
                .send(userCredentials)
                .end((err, res) => {
                    chai.expect(err).to.be.null;
                    res.should.have.status(302);
                    chai.expect(res).to.redirect;
                    chai.expect(res).to.redirectTo('/');
                    done();
                })
        });
    });
});

