import { useEffect, useState } from 'react';
import { Task, Category } from '../types';
import { TaskRepository } from '../services/task.repository';
import { CategoryRepository } from '../services/category.repository';
import { QuickAddTask } from './QuickAddTask';
import { TaskList } from './TaskList';
import { Sidebar, ViewType } from './Sidebar';
import { getLocalTodayDateString } from '../utils/date';
import './tasks.css';

export function TaskApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('all');
  const [autoExpandTaskId, setAutoExpandTaskId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedTasks, loadedCategories] = await Promise.all([
        TaskRepository.getTasks(),
        CategoryRepository.getCategories()
      ]);
      setTasks(loadedTasks);
      setCategories(loadedCategories);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (title: string) => {
    try {
      const due_date = currentView === 'today' ? getLocalTodayDateString() : undefined;
      const category_id = typeof currentView === 'number' ? currentView : undefined;
      
      const newTask = await TaskRepository.createTask({
        title,
        status: 'pending',
        priority: 'medium',
        due_date,
        category_id
      } as any);
      
      setTasks(prev => [newTask, ...prev]);
      setAutoExpandTaskId(newTask.id); // Triggers auto-expand in TaskItem
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const handleCreateCategory = async (name: string, color: string | null = null) => {
    try {
      const newCategory = await CategoryRepository.createCategory(name, color);
      setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
      return newCategory;
    } catch (error) {
      console.error("Error creating category:", error);
      return null;
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

  const handleDeleteCategory = async (id: number) => {
    try {
      await CategoryRepository.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      // Reset category for tasks in memory
      setTasks(prev => prev.map(t => {
        if (t.category_id === id) {
          return { ...t, category_id: undefined, category_name: undefined, category_color: undefined };
        }
        return t;
      }));
      if (currentView === id) {
        setCurrentView('all');
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleEmptyCompletedTasks = async () => {
    if (window.confirm("¿Seguro que quieres vaciar todas las tareas completadas?")) {
      try {
        await TaskRepository.deleteAllCompletedTasks();
        setTasks(prev => prev.filter(t => t.status !== 'completed'));
      } catch (error) {
        console.error("Error emptying completed tasks:", error);
      }
    }
  };

  const getFilteredTasks = () => {
    const todayStr = getLocalTodayDateString();
    let filtered = tasks.filter(task => {
      // Filtrar por categoría (ViewType = number)
      if (typeof currentView === 'number') {
        return task.status !== 'completed' && task.category_id === currentView;
      }

      if (currentView === 'completed') {
        return task.status === 'completed';
      }
      
      if (task.status === 'completed') return false;

      if (currentView === 'all') return true;
      
      if (currentView === 'today') {
        return task.due_date === todayStr;
      }
      
      if (currentView === 'upcoming') {
        return task.due_date && task.due_date > todayStr;
      }
      
      if (currentView === 'overdue') {
        return task.due_date && task.due_date < todayStr;
      }
      
      return true;
    });

    const priorityWeight = { high: 3, medium: 2, low: 1 };

    return filtered.sort((a, b) => {
      // Regla de prioridad absoluta para la nueva tarea
      if (a.id === autoExpandTaskId) return -1;
      if (b.id === autoExpandTaskId) return 1;

      if (currentView === 'completed') {
        const dateA = a.updated_at || '';
        const dateB = b.updated_at || '';
        return dateB.localeCompare(dateA);
      }

      if (a.due_date && b.due_date) {
        if (a.due_date !== b.due_date) {
          return a.due_date.localeCompare(b.due_date);
        }
      } else if (a.due_date && !b.due_date) {
        return -1;
      } else if (!a.due_date && b.due_date) {
        return 1;
      }

      const pA = priorityWeight[a.priority] || 0;
      const pB = priorityWeight[b.priority] || 0;
      if (pA !== pB) {
        return pB - pA;
      }

      return b.id - a.id;
    });
  };

  if (isLoading) {
    return <div style={{ padding: '20px', color: 'var(--text-muted)' }}>Cargando datos...</div>;
  }

  const filteredTasks = getFilteredTasks();
  const showQuickAdd = currentView !== 'completed' && currentView !== 'overdue';

  let currentTitle = 'Mis Tareas';
  if (typeof currentView === 'number') {
    const cat = categories.find(c => c.id === currentView);
    if (cat) currentTitle = cat.name;
  } else {
    const viewTitles: Record<string, string> = {
      all: 'Todas',
      today: 'Hoy',
      upcoming: 'Próximas',
      overdue: 'Vencidas',
      completed: 'Completadas'
    };
    currentTitle = viewTitles[currentView] || 'Mis Tareas';
  }

  return (
    <div className="task-app-container">
      <Sidebar 
        currentView={currentView} 
        tasks={tasks}
        categories={categories}
        onViewChange={setCurrentView}
        onDeleteCategory={handleDeleteCategory}
      />
      
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 className="app-title" style={{ marginBottom: 0, color: typeof currentView === 'number' ? (categories.find(c => c.id === currentView)?.color || 'inherit') : undefined }}>
            {currentTitle}
          </h1>
          {currentView === 'completed' && filteredTasks.length > 0 && (
            <button 
              className="priority-btn" 
              style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-bg)' }}
              onClick={handleEmptyCompletedTasks}
            >
              Vaciar completadas
            </button>
          )}
        </div>
        
        {showQuickAdd && (
          <div className="quick-add-section">
            <QuickAddTask onAdd={handleCreateTask} />
          </div>
        )}
        
        <div className="task-section">
          <TaskList 
            tasks={filteredTasks} 
            categories={categories}
            currentView={currentView}
            autoExpandTaskId={autoExpandTaskId}
            onToggle={handleToggleTask} 
            onDelete={handleDeleteTask}
            onUpdate={handleUpdateTask}
            onCreateCategory={handleCreateCategory}
            onClearAutoExpand={() => setAutoExpandTaskId(null)}
          />
        </div>
      </main>
    </div>
  );
}
