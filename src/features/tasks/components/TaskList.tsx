import { Task, UpdateTaskInput } from '../types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, updates: UpdateTaskInput) => void;
}

export function TaskList({ tasks, onToggle, onDelete, onUpdate }: TaskListProps) {
  if (tasks.length === 0) {
    return <div className="task-list-empty">No tienes tareas. ¡Aprovecha el día!</div>;
  }

  return (
    <div className="task-list">
      {tasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onToggle={onToggle} 
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
