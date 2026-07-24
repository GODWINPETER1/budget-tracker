const db = require('../config/db');

const TABLE = 'budgets';

function findAllByUser(userId, month) {
  let query = db(TABLE).where({ user_id: userId });
  if (month) query = query.andWhere({ month });
  return query.orderBy('category_id');
}

function findById(id, userId) {
  return db(TABLE).where({ id, user_id: userId }).first();
}

function findByUserCategoryMonth(userId, categoryId, month) {
  return db(TABLE).where({ user_id: userId, category_id: categoryId, month }).first();
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

module.exports = { findAllByUser, findById, findByUserCategoryMonth, create, update, remove };