import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import dayjs from 'dayjs';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category_id: '', amount_limit: '' });
  const [error, setError] = useState('');
  const month = dayjs().format('YYYY-MM-01');

  const loadBudgets = useCallback(() => {
    setLoading(true);
    api.get('/budgets', { params: { month } })
      .then((res) => setBudgets(res.data.budgets))
      .finally(() => setLoading(false));
  }, [month]);

  useEffect(() => { loadBudgets(); }, [loadBudgets]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/budgets', { ...form, month });
      setShowForm(false);
      setForm({ category_id: '', amount_limit: '' });
      loadBudgets();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this budget?')) return;
    await api.delete(`/budgets/${id}`);
    loadBudgets();
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-text">Budgets</h2>
          <p className="text-text-muted">{dayjs(month).format('MMMM YYYY')}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-brass text-bg font-medium rounded-md px-4 py-2 hover:bg-brass-dim transition-colors"
        >
          + Add Budget
        </button>
      </div>

      {loading ? (
        <p className="text-text-muted">Loading...</p>
      ) : budgets.length === 0 ? (
        <p className="text-text-muted">No budgets set for this month yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {budgets.map((b) => {
            const category = categories.find((c) => c.id === b.category_id);
            const pct = Math.min((b.spent / b.amount_limit) * 100, 100);
            const over = b.spent > b.amount_limit;
            return (
              <div key={b.id} className="bg-surface border border-border rounded-lg p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium">{category?.name || 'Unknown'}</p>
                    <p className="text-xs text-text-muted font-mono">
                      ${Number(b.spent).toFixed(2)} / ${Number(b.amount_limit).toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="text-text-muted hover:text-danger text-xs"
                  >
                    Delete
                  </button>
                </div>
                <div className="h-2 bg-bg rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${over ? 'bg-danger' : 'bg-brass'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {over && (
                  <p className="text-danger text-xs mt-2">
                    Over budget by ${(b.spent - b.amount_limit).toFixed(2)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-sm">
            <h3 className="font-display text-xl mb-4">Add Budget</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                required
                className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select category</option>
                {categories.filter((c) => c.type === 'expense').map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <input
                type="number"
                step="0.01"
                placeholder="Monthly limit"
                value={form.amount_limit}
                onChange={(e) => setForm({ ...form, amount_limit: e.target.value })}
                required
                className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm font-mono"
              />

              {error && <p className="text-danger text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-border rounded-md py-2 text-sm hover:bg-surface-hover">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-brass text-bg font-medium rounded-md py-2 text-sm hover:bg-brass-dim">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}