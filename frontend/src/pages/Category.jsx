import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'expense' });
  const [error, setError] = useState('');

  const loadCategories = useCallback(() => {
    setLoading(true);
    api.get('/categories').then((res) => setCategories(res.data.categories)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/categories', form);
      setShowForm(false);
      setForm({ name: '', type: 'expense' });
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this category? Transactions using it will become uncategorized.')) return;
    await api.delete(`/categories/${id}`);
    loadCategories();
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-text">Categories</h2>
          <p className="text-text-muted">Organize your income and expenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-brass text-bg font-medium rounded-md px-4 py-2 hover:bg-brass-dim transition-colors"
        >
          + Add Category
        </button>
      </div>

      {loading ? (
        <p className="text-text-muted">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-text-muted">
          No categories yet. Click <span className="text-brass">+ Add Category</span> to create your first one (e.g. "Food", "Rent", "Salary").
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="bg-surface border border-border rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className={`text-xs capitalize ${c.type === 'income' ? 'text-success' : 'text-danger'}`}>
                  {c.type}
                </p>
              </div>
              <button onClick={() => handleDelete(c.id)} className="text-text-muted hover:text-danger text-xs">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-sm">
            <h3 className="font-display text-xl mb-4">Add Category</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Name (e.g. Food, Salary)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
              />

              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>

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