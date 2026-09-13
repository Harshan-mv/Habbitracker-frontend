import React from 'react';
import { FileText } from 'lucide-react';
import useFinanceStore from '../../store/useFinanceStore';

export default function FinanceNoteSection() {
  const { monthData, updateNote } = useFinanceStore();

  return (
    <div
      className="p-4 rounded-xl flex flex-col h-full"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--glass-border)',
      }}
    >
      <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-[var(--text-primary)]">
        <FileText size={16} style={{ color: 'var(--accent-blue)' }} />
        Financial Note of the Month
      </div>
      <textarea
        className="w-full flex-1 p-3 rounded-lg text-sm transition-all resize-none"
        style={{
          background: 'rgba(0,0,0,0.15)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-primary)',
          outline: 'none',
          minHeight: '120px'
        }}
        placeholder="Add a small financial note here..."
        value={monthData.note || ''}
        onChange={(e) => updateNote(e.target.value)}
        onFocus={(e) => {
          e.target.style.border = '1px solid var(--accent-blue)';
          e.target.style.boxShadow = '0 0 0 2px rgba(var(--accent-blue-rgb), 0.2)';
        }}
        onBlur={(e) => {
          e.target.style.border = '1px solid var(--glass-border)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}
