const db = require('../config/db');

const TABLE = 'categories';

function findAllByUser(userId) {
  return db(TABLE).where({ user_id: userId }).orderBy('name');
}

function findById(id, userId) {
  return db(TABLE).where({ id, user_id: userId }).first();
}

function create({ user_id, name, type }) {
  return db(TABLE)
    .insert({ user_id, name, type })
    .then(([id]) => findById(id, user_id));
}

function update(id, userId, { name, type }) {
  return db(TABLE)
    .where({ id, user_id: userId })
    .update({ name, type })
    .then(() => findById(id, userId));
}

function remove(id, userId) {
  return db(TABLE).where({ id, user_id: userId }).del();
}

module.exports = { findAllByUser, findById, create, update, remove };