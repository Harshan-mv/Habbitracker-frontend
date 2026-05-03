import React, { useState } from 'react';
import useFinanceStore from '../../store/useFinanceStore';
import { Plus, Trash2, Pencil, Check, X, ShoppingCart } from 'lucide-react';

const CATEGORY_COLORS = {
  EMI: '#f59e0b',
  Transport: '#3b82f6',
  Food: '#ef4444',
  Health: '#10b981',
  Investment: '#8b5cf6',
  Entertainment: '#ec4899',
  'Emergency Fund': '#f97316',
  Other: '#6b7280',
};

export default function ExpenseSection() {
  const { monthData, addExpense, updateExpense, deleteExpense, CATEGORIES } = useFinanceStore();
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');

  const totalExpenses = monthData.expenses.reduce((s, e) => s + e.amount, 0);

  const handleAdd = () => {
    if (!name.trim() || !amount) return;
    addExpense(name.trim(), amount, category);
    setName('');
    setAmount('');
    setCategory('Other');
    setAdding(false);
  };

  const handleUpdate = (id) => {
    if (!name.trim() || !amount) return;
    updateExpense(id, name.trim(), amount, category);
    setEditId(null);
    setName('');
    setAmount('');
    setCategory('Other');
  };

  const startEdit = (exp) => {
    setEditId(exp._id || exp.id);
    setName(exp.name);
    setAmount(exp.amount);
    setCategory(exp.category);
    setAdding(false);
  };

  const cancelEdit = () => {
    setEditId(null);
    setName('');
    setAmount('');
    setCategory('Other');
  };

  return (
    <div
      className="finance-card rounded-2xl p-4"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(248,113,113,0.12)' }}
          >
            <ShoppingCart size={15} style={{ color: 'var(--accent-red)' }} />
          </div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            Expenses
          </h3>
        </div>
        <span
          className="text-xs font-semibold px-2 py-1 rounded-lg"
          style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--accent-red)' }}
        >
          ₹{totalExpenses.toLocaleString('en-IN')}
        </span>
      </div>

      {/* List */}
      <div className="space-y-2 mb-3" style={{ maxHeight: '260px', overflowY: 'auto' }}>
        {monthData.expenses.map((exp) =>
          editId === (exp._id || exp.id) ? (
            <div
              key={exp._id || exp.id}
              className="flex items-center gap-2 p-2 rounded-xl flex-wrap"
              style={{ background: 'var(--bg-hover)' }}
            >
              <input
                className="finance-input flex-1 min-w-[80px]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Expense"
                autoFocus
              />
              <input
                className="finance-input w-20"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amt"
              />
              <select
                className="finance-input w-28"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button className="finance-icon-btn green" onClick={() => handleUpdate(exp._id || exp.id)}>
                <Check size={14} />
              </button>
              <button className="finance-icon-btn muted" onClick={cancelEdit}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              key={exp._id || exp.id}
              className="flex items-center justify-between p-2.5 rounded-xl group transition-colors"
              style={{ background: 'var(--bg-primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-primary)')}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: CATEGORY_COLORS[exp.category] || '#6b7280' }}
                />
                <span
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {exp.name}
                </span>
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0"
                  style={{
                    background: (CATEGORY_COLORS[exp.category] || '#6b7280') + '18',
                    color: CATEGORY_COLORS[exp.category] || '#6b7280',
                  }}
                >
                  {exp.category}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-bold" style={{ color: 'var(--accent-red)' }}>
                  ₹{exp.amount.toLocaleString('en-IN')}
                </span>
                <button
                  className="finance-icon-btn muted opacity-0 group-hover:opacity-100"
                  onClick={() => startEdit(exp)}
                >
                  <Pencil size={12} />
                </button>
                <button
                  className="finance-icon-btn red opacity-0 group-hover:opacity-100"
                  onClick={() => deleteExpense(exp._id || exp.id)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Add row */}
      {adding ? (
        <div
          className="flex items-center gap-2 p-2 rounded-xl flex-wrap"
          style={{ background: 'var(--bg-hover)' }}
        >
          <input
            className="finance-input flex-1 min-w-[80px]"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Expense name"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <input
            className="finance-input w-20"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amt"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <select
            className="finance-input w-28"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button className="finance-icon-btn green" onClick={handleAdd}>
            <Check size={14} />
          </button>
          <button
            className="finance-icon-btn muted"
            onClick={() => {
              setAdding(false);
              setName('');
              setAmount('');
              setCategory('Other');
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          className="flex items-center gap-2 w-full py-2.5 rounded-xl border border-dashed text-xs font-semibold justify-center transition-all"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-red)';
            e.currentTarget.style.color = 'var(--accent-red)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          onClick={() => {
            setAdding(true);
            setName('');
            setAmount('');
            setCategory('Other');
          }}
        >
          <Plus size={14} /> Add Expense
        </button>
      )}
    </div>
  );
}
