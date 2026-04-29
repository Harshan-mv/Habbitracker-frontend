import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskItem from './TaskItem';
import useTaskStore from '../../store/useTaskStore';
import Skeleton from '../Skeleton';

export default function TaskList({ tasks }) {
  const { reorderTasks, isLoadingTasks } = useTaskStore();

  const onDragEnd = (result) => {
    if (!result.destination) return;
    reorderTasks(result.source.index, result.destination.index);
  };

  const totalBudget = tasks.reduce((acc, task) => acc + (task.budget?.amount || 0), 0);
  const currency = tasks[0]?.budget?.currency || '₹';

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-1">
        {isLoadingTasks ? (
          // Skeleton loading state
          Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className="mb-3 p-4 rounded-2xl flex items-center gap-4"
              style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
            >
              <Skeleton variant="circle" width="20px" height="20px" />
              <div className="flex-1">
                <Skeleton width="60%" height="16px" className="mb-2" />
                <Skeleton width="30%" height="12px" />
              </div>
              <Skeleton width="60px" height="24px" variant="rect" />
            </div>
          ))
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {tasks.map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(provided, snapshot) => (
                        <TaskItem 
                          task={task} 
                          provided={provided} 
                          isDragging={snapshot.isDragging}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {!isLoadingTasks && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted" style={{ color: 'var(--text-muted)' }}>
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm">Add a new task to get started</p>
          </div>
        )}
      </div>

      {/* Budget Summary Footer */}
      {tasks.length > 0 && (
        <div 
          className="mt-4 p-4 rounded-xl flex items-center justify-between"
          style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
        >
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Total Estimated Spend
          </span>
          <span className="text-xl font-bold" style={{ color: 'var(--accent-green)' }}>
            {currency}{totalBudget.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}
