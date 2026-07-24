const db = require('../config/db');

function summaryForMonth(userId, month) {
  return db('transactions')
    .where({ user_id: userId })
    .andWhere('date', '>=', month)
    .andWhere('date', '<=', db.raw('LAST_DAY(?)', [month]))
    .select('type')
    .sum('amount as total')
    .groupBy('type');
}

function categoryBreakdown(userId, month) {
  return db('transactions as t')
    .join('categories as c', 't.category_id', 'c.id')
    .where('t.user_id', userId)
    .andWhere('t.type', 'expense')
    .andWhere('t.date', '>=', month)
    .andWhere('t.date', '<=', db.raw('LAST_DAY(?)', [month]))
    .select('c.name as category')
    .sum('t.amount as total')
    .groupBy('c.name')
    .orderBy('total', 'desc');
}

function monthlyTrend(userId, monthsBack = 6) {
  return db('transactions')
    .where({ user_id: userId })
    .andWhere('date', '>=', db.raw('DATE_SUB(CURDATE(), INTERVAL ? MONTH)', [monthsBack]))
    .select(db.raw("DATE_FORMAT(date, '%Y-%m') as month"), 'type')
    .sum('amount as total')
    .groupBy('month', 'type')
    .orderBy('month', 'asc');
}

module.exports = { summaryForMonth, categoryBreakdown, monthlyTrend };