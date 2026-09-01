import { useEffect, useState } from 'react';
import { Task } from '../types';
import { TaskRepository } from '../services/task.repository';
import { QuickAddTask } from './QuickAddTask';
import { TaskList } from './TaskList';
import './tasks.css';

export function TaskApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const loadedTasks = await TaskRepository.getTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (title: string) => {
    try {
      const newTask = await TaskRepository.createTask({ title, priority: 'medium' });
      setTasks(prev => [newTask, ...prev]);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleToggleTask = async (id: number) => {
    try {
      const updatedTask = await TaskRepository.toggleTaskCompletion(id);
      setTasks(prev => prev.map(t => (t.id === id ? updatedTask : t)));
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await TaskRepository.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleUpdateTask = async (id: number, updates: import('../types').UpdateTaskInput) => {
    try {
      const updatedTask = await TaskRepository.updateTask(id, updates);
      setTasks(prev => prev.map(t => (t.id === id ? updatedTask : t)));
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '20px', color: '#888' }}>Cargando tareas...</div>;
  }

  return (
    <div className="task-app-container">
      <h1 className="app-title">Todo List</h1>
      <QuickAddTask onAdd={handleCreateTask} />
      
      <div className="task-section">
        <h2 className="section-title">HOY</h2>
        <TaskList 
          tasks={tasks} 
          onToggle={handleToggleTask} 
          onDelete={handleDeleteTask}
          onUpdate={handleUpdateTask}
        />
      </div>
    </div>
  );
}
