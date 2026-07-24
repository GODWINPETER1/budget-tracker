import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../api/client';

const PIE_COLORS = ['#C9A227', '#5C8A66', '#B3483F', '#8F7420', '#9A958C', '#7A9E8A'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats/dashboard')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 text-text-muted font-mono">Loading...</div>;
  }

  if (!data) {
    return <div className="p-8 text-text-muted">Couldn't load dashboard data.</div>;
  }

  const { income, expense, balance, categoryBreakdown, trend } = data;

  // reshape trend data from [{month, type, total}] into [{month, income, expense}]
  const trendByMonth = {};
  trend.forEach((row) => {
    if (!trendByMonth[row.month]) trendByMonth[row.month] = { month: row.month, income: 0, expense: 0 };
    trendByMonth[row.month][row.type] = Number(row.total);
  });
  const trendData = Object.values(trendByMonth);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="font-display text-3xl text-text">Dashboard</h2>
        <p className="text-text-muted">This month's overview</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SummaryCard label="Income" amount={income} color="text-success" />
        <SummaryCard label="Expenses" amount={expense} color="text-danger" />
        <SummaryCard label="Balance" amount={balance} color="text-brass" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="font-display text-lg mb-4">Spending by Category</h3>
          {categoryBreakdown.length === 0 ? (
            <p className="text-text-muted text-sm">No expenses yet this month.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ category }) => category}
                >
                  {categoryBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1C1A18', border: '1px solid #322E2A', borderRadius: 8 }}
                  formatter={(value) => `$${value.toFixed(2)}`}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="font-display text-lg mb-4">Income vs Expense (6mo)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trendData}>
              <XAxis dataKey="month" stroke="#9A958C" fontSize={12} />
              <YAxis stroke="#9A958C" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#1C1A18', border: '1px solid #322E2A', borderRadius: 8 }}
                formatter={(value) => `$${value.toFixed(2)}`}
              />
              <Legend />
              <Bar dataKey="income" fill="#5C8A66" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#B3483F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, amount, color }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <p className="text-text-muted text-sm mb-2">{label}</p>
      <p className={`font-mono text-2xl ${color}`}>
        ${Number(amount).toFixed(2)}
      </p>
    </div>
  );
}