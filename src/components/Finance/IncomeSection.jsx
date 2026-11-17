import { useState } from 'react';
import useFinanceStore from '../../store/useFinanceStore';
import { Plus, Trash2, Pencil, Check, X, IndianRupee } from 'lucide-react';

export default function IncomeSection() {
  const { monthData, addIncome, updateIncome, deleteIncome, getCategoryOptions } = useFinanceStore();
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [sourceType, setSourceType] = useState('Salary');
  const sourceTypes = getCategoryOptions('income');

  const totalIncome = monthData.incomes.reduce((s, i) => s + i.amount, 0);

  const handleAdd = () => {
    if (!name.trim() || !amount) return;
    addIncome(name.trim(), amount, sourceType);
    setName('');
    setAmount('');
    setSourceType('Salary');
    setAdding(false);
  };

  const handleUpdate = (id) => {
    if (!name.trim() || !amount) return;
    updateIncome(id, name.trim(), amount, sourceType);
    setEditId(null);
    setName('');
    setAmount('');
    setSourceType('Salary');
  };

  const startEdit = (income) => {
    setEditId(income._id || income.id);
    setName(income.name);
    setAmount(income.amount);
    setSourceType(income.sourceType || '');
    setAdding(false);
  };

  const cancelEdit = () => {
    setEditId(null);
    setName('');
    setAmount('');
    setSourceType('Salary');
  };

  return (
    <div
      className="finance-card rounded-[var(--radius-card)] p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <IndianRupee size={17} style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Income sources</h3>
        </div>
        <span className="text-sm font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>
          ₹{totalIncome.toLocaleString('en-IN')}
        </span>
      </div>

      {/* List */}
      <div className="mb-3 space-y-2">
        {!monthData.incomes.length && !adding && !editId && (
          <p className="rounded-[var(--radius-control)] border border-dashed border-[var(--line)] px-3 py-5 text-center text-sm text-[var(--text-secondary)]">
            No income sources this month
          </p>
        )}
        {monthData.incomes.map((inc) =>
          editId === (inc._id || inc.id) ? (
            <div
              key={inc._id || inc.id}
              className="flex flex-wrap items-center gap-2 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] p-2"
            >
              <input
                className="finance-input flex-1"
                aria-label="Income source name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Source"
                autoFocus
              />
              <select
                className="finance-input w-32"
                aria-label="Income source type"
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
              >
                <option value="">No type</option>
                {sourceTypes.map((option) => <option key={option._id || option.name} value={option.name}>{option.name}</option>)}
                {sourceType && !sourceTypes.some((option) => option.name === sourceType) && <option value={sourceType}>{sourceType}</option>}
              </select>
              <input
                className="finance-input w-24"
                type="number"
                min="0"
                aria-label="Income source amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
              />
              <button className="finance-icon-btn green" onClick={() => handleUpdate(inc._id || inc.id)}>
                <span className="sr-only">Save income source</span>
                <Check size={14} />
              </button>
              <button className="finance-icon-btn muted" onClick={cancelEdit}>
                <span className="sr-only">Cancel editing income source</span>
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              key={inc._id || inc.id}
              className="flex items-center justify-between gap-2 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] p-2.5"
            >
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {inc.name}
                {inc.sourceType && <span className="ms-2 text-xs text-[var(--text-muted)]">{inc.sourceType}</span>}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>
                  ₹{inc.amount.toLocaleString('en-IN')}
                </span>
                <button
                  className="finance-icon-btn muted"
                  onClick={() => startEdit(inc)}
                  aria-label={`Edit income source ${inc.name}`}
                >
                  <Pencil size={12} />
                </button>
                <button
                  className="finance-icon-btn red"
                  onClick={() => deleteIncome(inc._id || inc.id)}
                  aria-label={`Delete income source ${inc.name}`}
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
        <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface-raised)] p-2">
          <input
            className="finance-input flex-1"
            aria-label="New income source name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Source name"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <select
            className="finance-input w-32"
            aria-label="New income source type"
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value)}
          >
            {sourceTypes.map((option) => <option key={option._id || option.name} value={option.name}>{option.name}</option>)}
          </select>
          <input
            className="finance-input w-24"
            type="number"
            min="0"
            aria-label="New income amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button className="finance-icon-btn green" onClick={handleAdd}>
            <span className="sr-only">Save new income source</span>
            <Check size={14} />
          </button>
          <button className="finance-icon-btn muted" onClick={() => { setAdding(false); setName(''); setAmount(''); setSourceType('Salary'); }}>
            <span className="sr-only">Cancel new income source</span>
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          className="flex min-h-10 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-dashed border-[var(--line)] text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-raised)] hover:text-[var(--accent)]"
          onClick={() => { setAdding(true); setName(''); setAmount(''); }}
        >
          <Plus size={15} /> Add income
        </button>
      )}
    </div>
  );
}
