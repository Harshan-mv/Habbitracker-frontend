import React, { useState } from 'react';
import useFinanceStore from '../../store/useFinanceStore';
import { Plus, Trash2, Pencil, Check, X, IndianRupee } from 'lucide-react';

export default function IncomeSection() {
  const { monthData, addIncome, updateIncome, deleteIncome } = useFinanceStore();
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');

  const totalIncome = monthData.incomes.reduce((s, i) => s + i.amount, 0);

  const handleAdd = () => {
    if (!name.trim() || !amount) return;
    addIncome(name.trim(), amount);
    setName('');
    setAmount('');
    setAdding(false);
  };

  const handleUpdate = (id) => {
    if (!name.trim() || !amount) return;
    updateIncome(id, name.trim(), amount);
    setEditId(null);
    setName('');
    setAmount('');
  };

  const startEdit = (income) => {
    setEditId(income._id || income.id);
    setName(income.name);
    setAmount(income.amount);
    setAdding(false);
  };

  const cancelEdit = () => {
    setEditId(null);
    setName('');
    setAmount('');
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
            style={{ background: 'rgba(74,222,128,0.12)' }}
          >
            <IndianRupee size={15} style={{ color: 'var(--accent-green)' }} />
          </div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            Income Sources
          </h3>
        </div>
        <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: 'rgba(74,222,128,0.1)', color: 'var(--accent-green)' }}>
          ₹{totalIncome.toLocaleString('en-IN')}
        </span>
      </div>

      {/* List */}
      <div className="space-y-2 mb-3">
        {monthData.incomes.map((inc) =>
          editId === (inc._id || inc.id) ? (
            <div
              key={inc._id || inc.id}
              className="flex items-center gap-2 p-2 rounded-xl"
              style={{ background: 'var(--bg-hover)' }}
            >
              <input
                className="finance-input flex-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Source"
                autoFocus
              />
              <input
                className="finance-input w-24"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
              />
              <button className="finance-icon-btn green" onClick={() => handleUpdate(inc._id || inc.id)}>
                <Check size={14} />
              </button>
              <button className="finance-icon-btn muted" onClick={cancelEdit}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              key={inc._id || inc.id}
              className="flex items-center justify-between p-2.5 rounded-xl group transition-colors"
              style={{ background: 'var(--bg-primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-primary)')}
            >
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {inc.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold" style={{ color: 'var(--accent-green)' }}>
                  ₹{inc.amount.toLocaleString('en-IN')}
                </span>
                <button
                  className="finance-icon-btn muted opacity-0 group-hover:opacity-100"
                  onClick={() => startEdit(inc)}
                >
                  <Pencil size={12} />
                </button>
                <button
                  className="finance-icon-btn red opacity-0 group-hover:opacity-100"
                  onClick={() => deleteIncome(inc._id || inc.id)}
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
        <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: 'var(--bg-hover)' }}>
          <input
            className="finance-input flex-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Source name"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <input
            className="finance-input w-24"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button className="finance-icon-btn green" onClick={handleAdd}>
            <Check size={14} />
          </button>
          <button className="finance-icon-btn muted" onClick={() => { setAdding(false); setName(''); setAmount(''); }}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          className="flex items-center gap-2 w-full py-2.5 rounded-xl border border-dashed text-xs font-semibold justify-center transition-all"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-green)';
            e.currentTarget.style.color = 'var(--accent-green)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          onClick={() => { setAdding(true); setName(''); setAmount(''); }}
        >
          <Plus size={14} /> Add Income
        </button>
      )}
    </div>
  );
}
