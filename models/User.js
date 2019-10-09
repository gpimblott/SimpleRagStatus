'use strict';

module.exports = class User{
    constructor(username, firstname, surname, role_id, email, enabled) {
        this.username = username;
        this.firstname = firstname;
        this.surname = surname;
        this.role_id = role_id;
        this.email = email;
        this.enabled = enabled;
    }
}