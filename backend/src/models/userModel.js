const db = require('../config/db');

const TABLE = "users";

function findByEmail(email) {

    return db(TABLE).where( { email }).first();
}

function findById(id) {

    return db(TABLE).where({ id }).first();
}

function create({ name , email , password_hash }) {

    return db(TABLE)
        .insert({ name , email , password_hash })
        .then(([id]) => findById(id))
}

module.exports = { findByEmail , findById , create };