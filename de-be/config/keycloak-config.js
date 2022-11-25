const session = require('express-session');
const Keycloak = require('keycloak-connect');
const {keyCloak} = require("./index");

let _keycloak;
const memoryStore = new session.MemoryStore();

const keycloakConfig = {
    "realm":keyCloak.realm,
    "bearer-only": true,
    "auth-server-url": keyCloak.auth_server_url,
    "ssl-required": "none",
    "resource": "rebid-desk-bearer",
    "verify-token-audience": true,
    "use-resource-role-mappings": true,
    "confidential-port": 0
};

function initKeycloak() {
    if (_keycloak) {
        console.warn("Trying to init Keycloak again!");
        return _keycloak;
    }
    else {
        console.log("Initializing Keycloak...");
        _keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);
        return _keycloak;
    }
}

function getKeycloak() {
    if (!_keycloak){
        console.error('Keycloak has not been initialized. Please call init first.');
    }
    return _keycloak;
}

module.exports = {
    initKeycloak,
    getKeycloak,
    memoryStore
};