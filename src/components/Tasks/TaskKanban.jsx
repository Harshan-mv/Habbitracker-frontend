import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import TaskItem from './TaskItem';
import useTaskStore from '../../store/useTaskStore';
import { clsx } from 'clsx';

const COLUMNS = [
  { id: 'Not Started', label: 'To Do', color: 'var(--status-gray)' },
  { id: 'In Progress', label: 'In Progress', color: 'var(--status-amber)' },
  { id: 'Blocked', label: 'Blocked', color: 'var(--status-red)' },
  { id: 'Done', label: 'Completed', color: 'var(--accent-green)' },
];

export default function TaskKanban({ tasks }) {
  const { updateTask } = useTaskStore();

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    if (destination.droppableId !== source.droppableId) {
      updateTask(draggableId, { status: destination.droppableId });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 h-full min-h-[500px]">
        {COLUMNS.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-80 flex flex-col">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
              <h3 className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                {col.label}
              </h3>
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-hover" style={{ color: 'var(--text-muted)' }}>
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>

            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={clsx(
                    "flex-1 rounded-xl p-2 transition-colors border-2 border-dashed",
                    snapshot.isDraggingOver ? "bg-hover border-accent-green/30" : "border-transparent"
                  )}
                  style={{ background: snapshot.isDraggingOver ? 'var(--bg-hover)' : 'transparent' }}
                >
                  {tasks
                    .filter((t) => t.status === col.id)
                    .map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided, snapshot) => (
                          <div className="mb-3">
                            <TaskItem 
                              task={task} 
                              provided={provided} 
                              isDragging={snapshot.isDragging}
                              isKanban={true}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
