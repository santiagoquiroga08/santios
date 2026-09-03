import { Task, Category, UpdateTaskInput } from '../types';
import { TaskItem } from './TaskItem';
import { ViewType } from './Sidebar';

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  currentView: ViewType;
  autoExpandTaskId: string | null;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: UpdateTaskInput) => void;
  onCreateCategory: (name: string, color?: string | null) => Promise<Category | null>;
  onClearAutoExpand: () => void;
}

export function TaskList({ tasks, categories, currentView, autoExpandTaskId, onToggle, onDelete, onUpdate, onCreateCategory, onClearAutoExpand }: TaskListProps) {
  if (tasks.length === 0) {
    let emptyMessage = "No hay tareas aquí. ¡Buen trabajo!";
    if (currentView === 'today') emptyMessage = "No tienes tareas programadas para hoy.";
    if (currentView === 'upcoming') emptyMessage = "No hay tareas próximas.";
    if (currentView === 'overdue') emptyMessage = "¡Genial! No tienes tareas vencidas.";
    if (currentView === 'completed') emptyMessage = "Aún no has completado ninguna tarea.";

    return (
      <div className="task-list-empty-state">
        <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          categories={categories}
          autoExpand={task.id === autoExpandTaskId}
          onToggle={onToggle} 
          onDelete={onDelete}
          onUpdate={onUpdate}
          onCreateCategory={onCreateCategory}
          onClearAutoExpand={onClearAutoExpand}
        />
      ))}
    </div>
  );
}
