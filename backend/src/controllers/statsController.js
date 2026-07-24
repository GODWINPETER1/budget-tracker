const statsModel = require('../models/statsModel');
const dayjs = require('dayjs');

async function getDashboard(req, res) {
  try {
    const month = req.query.month || dayjs().format('YYYY-MM-01');

    const [summary, breakdown, trend] = await Promise.all([
      statsModel.summaryForMonth(req.userId, month),
      statsModel.categoryBreakdown(req.userId, month),
      statsModel.monthlyTrend(req.userId, 6),
    ]);

    const income = Number(summary.find((s) => s.type === 'income')?.total) || 0;
    const expense = Number(summary.find((s) => s.type === 'expense')?.total) || 0;

    res.json({
      month,
      income,
      expense,
      balance: income - expense,
      categoryBreakdown: breakdown.map((b) => ({ ...b, total: Number(b.total) })),
      trend,
    });
  } catch (err) {
    console.error('Get dashboard stats error:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { getDashboard };