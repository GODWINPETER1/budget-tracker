const db = require('../config/db');

const TABLE = 'recurring_rules';

function findAllByUser(userId) {
  return db(TABLE).where({ user_id: userId }).orderBy('start_date', 'desc');
}

function findById(id, userId) {
  return db(TABLE).where({ id, user_id: userId }).first();
}

function findAllActive() {
  // used by the generation engine — active rules across ALL users
  const today = new Date().toISOString().slice(0, 10);
  return db(TABLE)
    .where('start_date', '<=', today)
    .andWhere((builder) => {
      builder.whereNull('end_date').orWhere('end_date', '>=', today);
    });
}

function create(data) {
  return db(TABLE)
    .insert(data)
    .then(([id]) => findById(id, data.user_id));
}

function update(id, userId, data) {
  return db(TABLE)
    .where({ id, user_id: userId })
    .update(data)
    .then(() => findById(id, userId));
}

function remove(id, userId) {
  return db(TABLE).where({ id, user_id: userId }).del();
}

module.exports = { findAllByUser, findById, findAllActive, create, update, remove };