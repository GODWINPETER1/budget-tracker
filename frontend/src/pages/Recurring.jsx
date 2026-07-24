import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';

export default function Recurring() {
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    category_id: '', amount: '', type: 'expense', description: '',
    frequency: 'monthly', start_date: '', end_date: '',
  });

  const loadRules = useCallback(() => {
    setLoading(true);
    api.get('/recurring').then((res) => setRules(res.data.rules)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadRules(); }, [loadRules]);
  useEffect(() => { api.get('/categories').then((res) => setCategories(res.data.categories)); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, category_id: form.category_id || null, end_date: form.end_date || null };
      await api.post('/recurring', payload);
      setShowForm(false);
      setForm({ category_id: '', amount: '', type: 'expense', description: '', frequency: 'monthly', start_date: '', end_date: '' });
      loadRules();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this recurring rule? Past generated transactions will stay.')) return;
    await api.delete(`/recurring/${id}`);
    loadRules();
  }

  async function handleGenerate() {
    setGenerating(true);
    setGenerateMsg('');
    try {
      const res = await api.post('/recurring/generate');
      setGenerateMsg(`Generated ${res.data.totalGenerated} transaction(s).`);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-text">Recurring</h2>
          <p className="text-text-muted">Rules that auto-generate transactions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="border border-brass text-brass rounded-md px-4 py-2 text-sm hover:bg-surface disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Run Generation'}
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-brass text-bg font-medium rounded-md px-4 py-2 hover:bg-brass-dim transition-colors"
          >
            + Add Rule
          </button>
        </div>
      </div>

      {generateMsg && <p className="text-success text-sm">{generateMsg}</p>}

      {loading ? (
        <p className="text-text-muted">Loading...</p>
      ) : rules.length === 0 ? (
        <p className="text-text-muted">No recurring rules yet.</p>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-text-muted text-left">
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">End</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-surface-hover">
                  <td className="px-4 py-3">{r.description || '—'}</td>
                  <td className="px-4 py-3 capitalize text-text-muted">{r.frequency}</td>
                  <td className="px-4 py-3 font-mono text-text-muted">{r.start_date}</td>
                  <td className="px-4 py-3 font-mono text-text-muted">{r.end_date || 'Ongoing'}</td>
                  <td className={`px-4 py-3 text-right font-mono ${r.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {r.type === 'income' ? '+' : '-'}${Number(r.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(r.id)} className="text-text-muted hover:text-danger text-xs">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-sm">
            <h3 className="font-display text-xl mb-4">Add Recurring Rule</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="bg-bg border border-border rounded-md px-3 py-2 text-sm">
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <input type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required className="bg-bg border border-border rounded-md px-3 py-2 text-sm font-mono" />
              </div>

              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm">
                <option value="">Uncategorized</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <input type="text" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm" />

              <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>

              <div>
                <label className="block text-xs text-text-muted mb-1">Start date</label>
                <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm font-mono" />
              </div>

              <div>
                <label className="block text-xs text-text-muted mb-1">End date (optional)</label>
                <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm font-mono" />
              </div>

              {error && <p className="text-danger text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-border rounded-md py-2 text-sm hover:bg-surface-hover">Cancel</button>
                <button type="submit" className="flex-1 bg-brass text-bg font-medium rounded-md py-2 text-sm hover:bg-brass-dim">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}