'use strict';

// Import the dependencies for testing
import chai from 'chai';

import chaiHttp from 'chai-http';
import {describe} from 'mocha';
import app from '../app';


// Configure chai
chai.use(chaiHttp);
chai.should();

const adminUserCredentials = {
    username: 'admin',
    password: 'Password123!'
};

const guestUserCredentials = {
    username: 'guest',
    password: 'Password123!'
};

const badUserCredentials = {
    username: 'admin',
    password: 'badpassword'
};

const getEndpoints = [
    '/',
    '/changeMyPassword',
    '/upload-account-csv',
    '/project', '/project/1', '/project/1/milestone', '/project/1/milestone/1',
    '/project/1/status/1',
    '/project/1/risk', '/project/1/risk',
    '/report', '/report/1',
    '/account', '/account/1', '/account/1/password',
    '/programme/dashboard', '/programme/risks'
];

const postEndpoints = [
    {url: '/changeMyPassword', admin: false},
    {url: '/upload-account-csv', admin: true},
    {url: '/project', admin: true},
    {url: '/project/1', admin: true},
    {url: '/project/1/milestone', admin: true},
    {url: '/project/1/milestone/1', admin: true},
    {url: '/project/1/status/1', admin: true},
    {url: '/project/1/risk/1', admin: true},
    {url: '/report', admin: true},
    {url: '/report/1', admin: true},
    {url: '/account', admin: true},
    {url: '/account/1/password', admin: true}
];

const deleteEndpoints = [
    '/account/1',
    '/project/1/milestone/1',
    '/project/1',
    '/report/1'
];

describe("User needs to be authenticated to be access endpoints", () => {

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
                    .post(endpoint.url)
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
});

describe("check login works correctly", () => {
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
                .send(adminUserCredentials)
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

describe("Check admin only endpoints as user guest", () => {
    let agent = null;

    // Login user guest before running tests
    before((done) => {
        agent = chai.request.agent(app);
        agent.post('/auth/login')
            .redirects(0)
            .send(guestUserCredentials)
            .end((err, res) => {
                chai.expect(res).to.have.cookie('rage_cookie');
                chai.expect(err).to.be.null;
                done();
            });
    });

    // For each admin only endpoint check that Guest gets a 401 error
    postEndpoints.forEach((endpoint) => {
        if (endpoint.admin) {
            it("User 'guest' should not be able to access POST " + endpoint.url, (done) => {
                agent.post(endpoint.url)
                    .end((err, res) => {
                        chai.expect(err).to.be.null;
                        res.should.have.status(401);
                        done();
                    })
            });
        }
    });

    // Logout user guest
    after(() => {
        agent.get('/auth/logout')
            .end((err, res) => {
                res.should.have.status(302);
            });
        agent.close();
    });
});


