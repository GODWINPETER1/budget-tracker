import { useState } from 'react';
import api from '../api/client';

export default function TransactionForm({ transaction, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    amount: transaction?.amount || '',
    type: transaction?.type || 'expense',
    category_id: transaction?.category_id || '',
    description: transaction?.description || '',
    date: transaction?.date || new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = { ...form, category_id: form.category_id || null };
      if (transaction) {
        await api.put(`/transactions/${transaction.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-surface border border-border rounded-lg p-6 w-full max-w-md">
        <h3 className="font-display text-xl mb-4">
          {transaction ? 'Edit Transaction' : 'Add Transaction'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="bg-bg border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>

            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
              className="bg-bg border border-border rounded-md px-3 py-2 text-sm font-mono"
            />
          </div>

          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm"
          />

          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm font-mono"
          />

          {error && <p className="text-danger text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border rounded-md py-2 text-sm hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-brass text-bg font-medium rounded-md py-2 text-sm hover:bg-brass-dim disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}