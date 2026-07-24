import { useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import TransactionForm from '../components/TransactionForm';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ type: '', categoryId: '', page: 1 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadTransactions = useCallback(() => {
    setLoading(true);
    const params = { ...filters };
    Object.keys(params).forEach((k) => !params[k] && delete params[k]);
    api.get('/transactions', { params })
      .then((res) => {
        setTransactions(res.data.transactions);
        setMeta({ page: res.data.page, totalPages: res.data.totalPages });
      })
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data.categories));
  }, []);

  function handleFilterChange(key, value) {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  }

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return;
    await api.delete(`/transactions/${id}`);
    loadTransactions();
  }

  function handleFormSaved() {
    setShowForm(false);
    setEditing(null);
    loadTransactions();
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-text">Transactions</h2>
          <p className="text-text-muted">All income and expenses</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="bg-brass text-bg font-medium rounded-md px-4 py-2 hover:bg-brass-dim transition-colors"
        >
          + Add Transaction
        </button>
      </div>

      <div className="flex gap-3">
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="bg-surface border border-border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={filters.categoryId}
          onChange={(e) => handleFilterChange('categoryId', e.target.value)}
          className="bg-surface border border-border rounded-md px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-muted text-left">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-text-muted">Loading...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-text-muted">No transactions found.</td></tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="border-b border-border hover:bg-surface-hover">
                  <td className="px-4 py-3 font-mono text-text-muted">{t.date}</td>
                  <td className="px-4 py-3">{t.description || '—'}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {categories.find((c) => c.id === t.category_id)?.name || 'Uncategorized'}
                  </td>
                  <td className={`px-4 py-3 text-right font-mono ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      onClick={() => { setEditing(t); setShowForm(true); }}
                      className="text-text-muted hover:text-brass text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-text-muted hover:text-danger text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setFilters((f) => ({ ...f, page: p }))}
              className={`px-3 py-1 rounded-md text-sm ${
                p === meta.page ? 'bg-brass text-bg' : 'text-text-muted hover:bg-surface'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {showForm && (
        <TransactionForm
          transaction={editing}
          categories={categories}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={handleFormSaved}
        />
      )}
    </div>
  );
}