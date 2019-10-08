'use strict';

module.exports = class User{
    constructor(id, username, displayName, password, role, enabled) {
        this.id = id;
        this.username = username;
        this.displayName = displayName;
        this.password = password;
        this.role = role;
        this.enabled = enabled;
    }
}