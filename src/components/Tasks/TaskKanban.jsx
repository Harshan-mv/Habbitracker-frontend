import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { clsx } from 'clsx';
import TaskItem from './TaskItem';
import useTaskStore from '../../store/useTaskStore';
import Skeleton from '../Skeleton';

const COLUMNS = [
  { id: 'Not Started', label: 'To do' },
  { id: 'In Progress', label: 'In progress' },
  { id: 'Blocked', label: 'Blocked' },
  { id: 'Done', label: 'Done' },
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
              <div className="mb-2 flex min-h-10 items-center justify-between border-b border-[var(--line)] px-2">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">{column.label}</h3>
                {!isLoading && <span className="text-xs tabular-nums text-[var(--text-muted)]">{columnTasks.length}</span>}
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
                      className={clsx(
                        'min-h-28 flex-1 rounded-[var(--radius-control)] p-1 transition-colors',
                        snapshot.isDraggingOver && 'bg-[var(--surface-raised)]'
                      )}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(draggable, dragSnapshot) => (
                            <div className="mb-2">
                              <TaskItem
                                task={task}
                                provided={draggable}
                                isDragging={dragSnapshot.isDragging}
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
