const db = require('../config/db');

const TABLE = 'transactions';

function findAllByUser(userId, filters = {}) {
  const { type, categoryId, startDate, endDate, page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;

  let query = db(TABLE).where({ user_id: userId });

  if (type) query = query.andWhere({ type });
  if (categoryId) query = query.andWhere({ category_id: categoryId });
  if (startDate) query = query.andWhere('date', '>=', startDate);
  if (endDate) query = query.andWhere('date', '<=', endDate);

  return query.clone().count('* as count').first()
    .then((countResult) => {
      return query
        .orderBy('date', 'desc')
        .limit(limit)
        .offset(offset)
        .then((rows) => ({
          transactions: rows,
          total: Number(countResult.count),
          page: Number(page),
          totalPages: Math.ceil(countResult.count / limit),
        }));
    });
}

function findById(id, userId) {
  return db(TABLE).where({ id, user_id: userId }).first();
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

function sumByCategoryAndMonth(userId, categoryId, month) {
  // month is like '2026-08-01' — we want the whole month's range
  const startDate = month;
  const endDate = db.raw('LAST_DAY(?)', [month]);

  return db(TABLE)
    .where({ user_id: userId, category_id: categoryId, type: 'expense' })
    .andWhere('date', '>=', startDate)
    .andWhere('date', '<=', endDate)
    .sum('amount as total')
    .first();
}

module.exports = { findAllByUser, findById, create, update, remove, sumByCategoryAndMonth };
