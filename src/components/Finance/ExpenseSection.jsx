import { useRef, useState } from 'react';
import useFinanceStore from '../../store/useFinanceStore';
import { Plus, Trash2, Pencil, Check, X, ShoppingCart } from 'lucide-react';
import ConfirmDialog from '../ConfirmDialog';
import deleteFinanceItemAndWaitForSave from './deleteFinanceItemAndWaitForSave';

export default function ExpenseSection() {
  const { monthData, addExpense, updateExpense, deleteExpense, getCategoryOptions } = useFinanceStore();
  const dialogFallbackRef = useRef(null);
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const categories = getCategoryOptions('expense');

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

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteFinanceItemAndWaitForSave(() => deleteExpense(deleteTarget.id));
    }
  };

  return (
    <div
      ref={dialogFallbackRef}
      tabIndex={-1}
      className="finance-card finance-section-tint rounded-[var(--radius-card)] p-4"
      style={{ '--section-accent': 'var(--section-expense)', '--section-tint': 'var(--section-expense-bg)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ShoppingCart size={17} style={{ color: 'var(--section-expense)' }} />
          <h3 className="text-sm font-medium" style={{ color: 'var(--section-expense)' }}>Expenses</h3>
        </div>
        <span
          className="text-sm font-medium tabular-nums"
          style={{ color: 'var(--section-expense)' }}
        >
          ₹{totalExpenses.toLocaleString('en-IN')}
        </span>
      </div>

      {/* List */}
      <div className="mb-3 max-h-64 space-y-2 overflow-y-auto pe-1">
        {!monthData.expenses.length && !adding && !editId && (
          <p className="rounded-[var(--radius-control)] border border-dashed border-[var(--line)] px-3 py-5 text-center text-sm text-[var(--text-secondary)]">
            No expenses this month
          </p>
        )}
        {monthData.expenses.map((exp) =>
          editId === (exp._id || exp.id) ? (
            <div
              key={exp._id || exp.id}
              className="flex items-center gap-2 p-2 rounded-xl flex-wrap"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}
            >
              <input
                className="finance-input flex-1 min-w-[80px]"
                aria-label="Expense name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Expense"
                autoFocus
              />
              <input
                className="finance-input w-20"
                type="number"
                min="0"
                aria-label="Expense amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amt"
              />
              <select
                className="finance-input w-28"
                aria-label="Expense category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((option) => <option key={option._id || option.name} value={option.name}>{option.name}</option>)}
                {!categories.some((option) => option.name === category) && <option value={category}>{category}</option>}
              </select>
              <button className="finance-icon-btn green" onClick={() => handleUpdate(exp._id || exp.id)}>
                <span className="sr-only">Save expense</span>
                <Check size={14} />
              </button>
              <button className="finance-icon-btn muted" onClick={cancelEdit} aria-label="Cancel editing expense">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              key={exp._id || exp.id}
              className="flex items-center justify-between gap-2 rounded-[var(--radius-control)] border border-[var(--line)] bg-[var(--surface)] p-2.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: categories.find((option) => option.name === exp.category)?.color || 'var(--text-muted)' }}
                />
                <span
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {exp.name}
                </span>
                <span
                  className="rounded bg-[var(--surface-raised)] px-1.5 py-0.5 text-xs text-[var(--text-secondary)]"
                >
                  {exp.category}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-medium tabular-nums" style={{ color: 'var(--text-primary)' }}>
                  ₹{exp.amount.toLocaleString('en-IN')}
                </span>
                <button
                  className="finance-icon-btn muted"
                  onClick={() => startEdit(exp)}
                  aria-label={`Edit expense ${exp.name}`}
                >
                  <Pencil size={12} />
                </button>
                <button
                  type="button"
                  className="finance-icon-btn red"
                  onClick={(event) => setDeleteTarget({
                    id: exp._id || exp.id,
                    itemName: `${exp.name} – ₹${exp.amount.toLocaleString('en-IN')}`,
                    triggerElement: event.currentTarget,
                  })}
                  aria-label={`Delete expense ${exp.name}`}
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
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)' }}
        >
          <input
            className="finance-input flex-1 min-w-[80px]"
            aria-label="New expense name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Expense name"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <input
            className="finance-input w-20"
            type="number"
            min="0"
            aria-label="New expense amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amt"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <select
            className="finance-input w-28"
            aria-label="New expense category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((option) => <option key={option._id || option.name} value={option.name}>{option.name}</option>)}
            {!categories.some((option) => option.name === category) && <option value={category}>{category}</option>}
          </select>
          <button className="finance-icon-btn green" onClick={handleAdd} aria-label="Save new expense">
            <Check size={14} />
          </button>
          <button
            className="finance-icon-btn muted"
            aria-label="Cancel new expense"
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
          className="flex min-h-10 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-dashed border-[var(--line)] text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-raised)] hover:text-[var(--accent)]"
          onClick={() => {
            setAdding(true);
            setName('');
            setAmount('');
            setCategory('Other');
          }}
        >
          <Plus size={15} /> Add expense
        </button>
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete this expense?"
          itemName={deleteTarget.itemName}
          triggerElement={deleteTarget.triggerElement}
          fallbackFocusRef={dialogFallbackRef}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
