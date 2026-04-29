import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, MessageSquare, Trash2, CheckCircle2, Clock, AlertCircle, Ban } from 'lucide-react';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import useTaskStore from '../../store/useTaskStore';
import { clsx } from 'clsx';

const STATUS_COLORS = {
  'Not Started': 'var(--status-gray)',
  'In Progress': 'var(--status-amber)',
  'Done': 'var(--accent-green)',
  'Blocked': 'var(--status-red)',
};

const PRIORITY_COLORS = {
  'High': '#ef4444',
  'Medium': '#f59e0b',
  'Low': '#3b82f6',
};

export default function TaskItem({ task, provided, isDragging, isKanban }) {
  const { updateTask, deleteTask } = useTaskStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showRemarks, setShowRemarks] = useState(false);
  const titleRef = useRef(null);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    const newTitle = titleRef.current.innerText.trim();
    if (newTitle && newTitle !== task.title) {
      updateTask(task._id, { title: newTitle });
    } else {
      titleRef.current.innerText = task.title;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      titleRef.current.blur();
    }
  };

  const toggleStatus = () => {
    const statuses = ['Not Started', 'In Progress', 'Done', 'Blocked'];
    const nextIndex = (statuses.indexOf(task.status) + 1) % statuses.length;
    updateTask(task._id, { status: statuses[nextIndex] });
  };

  // Timeline Progress Calculation
  const calculateProgress = () => {
    if (!task.timeline?.startDate || !task.timeline?.endDate) return 0;
    const start = new Date(task.timeline.startDate);
    const end = new Date(task.timeline.endDate);
    const today = new Date();

    if (isPast(end) && !isToday(end)) return 100;
    if (today < start) return 0;

    const totalDays = differenceInDays(end, start);
    const elapsedDays = differenceInDays(today, start);
    return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  };

  const progress = calculateProgress();
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'Done';

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={clsx(
        "group relative flex flex-col mb-3 rounded-xl border transition-all",
        isDragging ? "shadow-xl scale-[1.02] z-50" : "hover:shadow-md",
        task.status === 'Done' ? "opacity-75" : "opacity-100",
        isOverdue ? "border-l-4 border-l-red-500" : "border-transparent"
      )}
      style={{ 
        background: 'var(--bg-secondary)', 
        borderColor: isDragging ? 'var(--accent-green)' : 'var(--border)',
        ...provided.draggableProps.style 
      }}
    >
      <div className={clsx("flex p-4 gap-4", isKanban ? "flex-col" : "items-center")}>
        <div className="flex items-center gap-4 w-full">
          {/* Drag Handle */}
          <div 
            {...provided.dragHandleProps}
            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-muted p-1"
            style={{ color: 'var(--text-muted)' }}
          >
            <GripVertical size={18} />
          </div>

          {/* Status Toggle */}
          <button 
            onClick={toggleStatus}
            className="flex-shrink-0 transition-transform active:scale-90"
            style={{ color: STATUS_COLORS[task.status] }}
          >
            {task.status === 'Done' ? <CheckCircle2 size={22} /> : 
             task.status === 'In Progress' ? <Clock size={22} /> :
             task.status === 'Blocked' ? <Ban size={22} /> :
             <div className="w-5 h-5 rounded-full border-2 border-current opacity-30" />}
          </button>

          {/* Title (Inline Edit) */}
          <div className="flex-1 min-w-0">
            <div
              ref={titleRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleTitleBlur}
              onKeyDown={handleKeyDown}
              className={clsx(
                "text-base font-medium outline-none truncate w-full",
                task.status === 'Done' && "line-through opacity-50"
              )}
              style={{ color: 'var(--text-primary)' }}
            >
              {task.title}
            </div>
            
            {/* Timeline Bar */}
            {task.timeline?.startDate && (
              <div className="mt-2 w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${progress}%`, 
                    background: STATUS_COLORS[task.status] || 'var(--accent-green)' 
                  }}
                />
              </div>
            )}
          </div>

          {!isKanban && (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowRemarks(!showRemarks)}
                className={clsx("p-2 rounded-lg transition-colors", showRemarks ? "bg-hover text-primary" : "text-muted hover:bg-hover")}
                style={{ color: showRemarks ? 'var(--text-primary)' : 'var(--text-muted)' }}
              >
                <MessageSquare size={16} />
              </button>
              <button 
                onClick={() => deleteTask(task._id)}
                className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-500 text-muted transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Metadata Badges */}
        <div className={clsx(
          "flex items-center gap-6",
          isKanban ? "w-full justify-between mt-2 pt-3 border-t border-dashed border-border" : "ml-auto mr-4"
        )}>
          {/* Priority */}
          <div className="flex flex-col items-start min-w-[60px]">
            <span className="text-[9px] uppercase tracking-tighter text-muted mb-1" style={{ color: 'var(--text-muted)' }}>Priority</span>
            <select
              value={task.priority}
              onChange={(e) => updateTask(task._id, { priority: e.target.value })}
              className="text-[11px] font-bold px-2 py-0.5 rounded-md border cursor-pointer outline-none transition-all"
              style={{ 
                backgroundColor: `${PRIORITY_COLORS[task.priority]}10`, 
                color: PRIORITY_COLORS[task.priority],
                borderColor: `${PRIORITY_COLORS[task.priority]}30`
              }}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Budget */}
          <div className="flex flex-col items-start min-w-[70px]">
            <span className="text-[9px] uppercase tracking-tighter text-muted mb-1" style={{ color: 'var(--text-muted)' }}>Budget</span>
            <div className="flex items-center gap-1 text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>
              <span className="text-muted font-medium">{task.budget?.currency}</span>
              <input 
                type="number"
                value={task.budget?.amount || 0}
                onChange={(e) => updateTask(task._id, { budget: { ...task.budget, amount: Number(e.target.value) } })}
                className="w-12 bg-transparent border-none outline-none text-left"
              />
            </div>
          </div>

          {/* Due Date */}
          <div className="flex flex-col items-start min-w-[80px]">
            <span className="text-[9px] uppercase tracking-tighter text-muted mb-1" style={{ color: 'var(--text-muted)' }}>Due Date</span>
            <input 
              type="date"
              value={task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''}
              onChange={(e) => updateTask(task._id, { dueDate: e.target.value })}
              className={clsx(
                "text-[11px] font-bold bg-transparent border-none outline-none cursor-pointer",
                isOverdue ? "text-red-500" : "text-primary"
              )}
              style={{ color: isOverdue ? '#ef4444' : 'var(--text-primary)' }}
            />
          </div>

          {isKanban && (
            <div className="flex items-center gap-1 ml-auto">
              <button 
                onClick={() => setShowRemarks(!showRemarks)}
                className="text-muted hover:text-primary transition-colors"
              >
                <MessageSquare size={14} />
              </button>
              <button 
                onClick={() => deleteTask(task._id)}
                className="text-muted hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Remarks */}
      {showRemarks && (
        <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
          <textarea
            value={task.remarks}
            onChange={(e) => updateTask(task._id, { remarks: e.target.value })}
            placeholder="Add notes..."
            className="w-full p-3 rounded-lg text-sm outline-none resize-none min-h-[80px]"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          />
        </div>
      )}
    </div>
  );
}
