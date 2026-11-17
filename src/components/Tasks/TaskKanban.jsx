import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { clsx } from 'clsx';
import TaskItem from './TaskItem';
import useTaskStore from '../../store/useTaskStore';
import Skeleton from '../Skeleton';

const COLUMNS = [
  { id: 'Not Started', label: 'To do', color: 'var(--status-todo)', background: 'var(--status-todo-bg)' },
  { id: 'In Progress', label: 'In progress', color: 'var(--status-progress)', background: 'var(--status-progress-bg)' },
  { id: 'Blocked', label: 'Blocked', color: 'var(--status-blocked)', background: 'var(--status-blocked-bg)' },
  { id: 'Done', label: 'Done', color: 'var(--status-done)', background: 'var(--status-done-bg)' },
];

export default function TaskKanban({ tasks, isLoading }) {
  const { updateTask, reorderTasks } = useTaskStore();

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) {
      const columnTasks = tasks.filter((task) => task.status === source.droppableId);
      reorderTasks(source.index, destination.index, columnTasks);
    } else {
      const targetOrder = tasks.filter((task) => task.status === destination.droppableId).length;
      updateTask(draggableId, { status: destination.droppableId, order: targetOrder });
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full min-h-0 gap-3 overflow-auto pb-2">
        {COLUMNS.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.id);
          return (
            <section key={column.id} aria-label={`${column.label} tasks`} className="flex min-h-0 w-[280px] shrink-0 flex-col md:w-[320px]">
              <div
                className="mb-2 flex min-h-11 items-center justify-between rounded-[var(--radius-control)] border border-[var(--line)] px-3"
                style={{ borderBlockStart: `3px solid ${column.color}`, backgroundColor: column.background }}
              >
                <h3 className="flex items-center gap-2 text-sm font-medium" style={{ color: column.color }}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: column.color }} aria-hidden="true" />
                  {column.label}
                </h3>
                {!isLoading && (
                  <span className="rounded-full px-2 py-0.5 text-xs font-medium tabular-nums" style={{ color: column.color, backgroundColor: 'var(--surface)' }}>
                    {columnTasks.length}
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="space-y-2 p-1" aria-label={`Loading ${column.label} tasks`}>
                  <div className="app-surface space-y-3 p-4">
                    <Skeleton width="42%" height="12px" />
                    <Skeleton width="100%" height="16px" />
                    <Skeleton width="62%" height="12px" />
                  </div>
                </div>
              ) : (
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={clsx('min-h-28 flex-1 rounded-[var(--radius-control)] border p-1 transition-colors', snapshot.isDraggingOver && 'border-2')}
                      style={{
                        backgroundColor: snapshot.isDraggingOver
                          ? `color-mix(in srgb, ${column.color} 16%, ${column.background})`
                          : column.background,
                        borderColor: snapshot.isDraggingOver ? column.color : 'transparent',
                      }}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(draggable, dragSnapshot) => (
                            <div className="mb-2">
                              <TaskItem
                                task={task}
                                provided={draggable}
                                isDragging={dragSnapshot.isDragging}
                                viewMode="board"
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {columnTasks.length === 0 && (
                        <p className="px-2 py-4 text-xs text-[var(--text-muted)]">No tasks in this column</p>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </section>
          );
        })}
      </div>
    </DragDropContext>
  );
}
