import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import TaskItem from './TaskItem';
import useTaskStore from '../../store/useTaskStore';
import Skeleton from '../Skeleton';

export default function TaskList({ tasks, onReorder, onDeleteRequest, isLoading, hasError, hasFilters }) {
  const { reorderTasks } = useTaskStore();

  const onDragEnd = (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    reorderTasks(result.source.index, result.destination.index, tasks);
    onReorder();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto pe-1">
        {isLoading ? (
          <div className="space-y-3" aria-label="Loading tasks">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="app-surface flex items-center gap-4 p-4">
                <Skeleton variant="circle" width="20px" height="20px" />
                <div className="flex-1 space-y-2">
                  <Skeleton width="58%" height="16px" />
                  <Skeleton width="32%" height="12px" />
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {tasks.map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(draggable, snapshot) => (
                        <TaskItem
                          task={task}
                          provided={draggable}
                          isDragging={snapshot.isDragging}
                          onDeleteRequest={onDeleteRequest}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--line)] px-6 text-center">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {hasError ? 'Tasks could not be loaded' : hasFilters ? 'No tasks match these filters' : 'No tasks yet'}
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {hasError ? 'Try again when your connection is available' : hasFilters ? 'Try another search or filter' : 'Add a task to start planning your work'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
