import { useEffect, useState, useRef } from 'react';
import { Task, Category } from '../types';
import { taskRepository, categoryRepository, isTauri } from '../../../services/di';
import { SyncService } from '../../../services/cloud/sync.service';
import { QuickAddTask } from './QuickAddTask';
import { TaskList } from './TaskList';
import { Sidebar, ViewType } from './Sidebar';
import { getLocalTodayDateString } from '../utils/date';
import { useAuth } from '../../auth/context/AuthContext';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { OfflineBanner } from '../../../components/OfflineBanner';
import './tasks.css';

export function TaskApp() {
  const { user } = useAuth();
  const isOnline = useNetworkStatus();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('all');
  const [autoExpandTaskId, setAutoExpandTaskId] = useState<string | null>(null);
  const syncInProgress = useRef(false);

  // Carga inicial y auto-recuperación de datos al volver a estar online
  useEffect(() => {
    if (user) {
      if (isTauri || isOnline) {
        loadData();
      }
    }
  }, [user, isOnline]);

  // Ejecuta la sincronización en segundo plano al recuperar el foco
  useEffect(() => {
    if (!user || !isTauri) return;
    
    const onFocus = () => {
      handleSyncBackground();
    };
    
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [loadedTasks, loadedCategories] = await Promise.all([
        taskRepository.getTasks(user.id),
        categoryRepository.getCategories(user.id)
      ]);
      setTasks(loadedTasks);
      setCategories(loadedCategories);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncBackground = async () => {
    if (!user || syncInProgress.current || !isTauri || !isOnline) return;
    
    syncInProgress.current = true;
    setIsSyncing(true);
    
    try {
      await SyncService.syncAll(user.id);
      // Recargamos silenciosamente los datos para reflejar cambios traídos de Turso
      await loadData();
    } catch (error) {
      console.error('Error en auto-sync:', error);
    } finally {
      syncInProgress.current = false;
      setIsSyncing(false);
    }
  };

  const handleCreateTask = async (title: string) => {
    if (!user) return;

    // Bloqueo defensivo en Web/PWA cuando no hay conexión a internet
    if (!isTauri && !isOnline) {
      alert("Sin conexión a internet. No se puede crear la tarea en la versión web.");
      return;
    }

    try {
      const due_date = currentView === 'today' ? getLocalTodayDateString() : undefined;
      const category_id = typeof currentView === 'string' && currentView.length > 10 ? currentView : undefined; // simple check if view is likely a UUID
      
      const newTask = await taskRepository.createTask({
        title,
        status: 'pending',
        priority: 'medium',
        due_date,
        category_id
      } as any, user.id);
      
      setTasks(prev => [newTask, ...prev]);
      setAutoExpandTaskId(newTask.id); // Triggers auto-expand in TaskItem
      
      handleSyncBackground(); // Auto-sync (silenciado si offline)
    } catch (error) {
      console.error("Error creating task:", error);
      alert("No se pudo crear la tarea debido a un error de conexión con la base de datos.");
    }
  };

  const handleCreateCategory = async (name: string, color: string | null = null) => {
    if (!user) return null;

    // Bloqueo defensivo en Web/PWA cuando no hay conexión a internet
    if (!isTauri && !isOnline) {
      alert("Sin conexión a internet. No se puede crear la categoría en la versión web.");
      return null;
    }

    try {
      const newCategory = await categoryRepository.createCategory(name, color, user.id);
      setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
      
      handleSyncBackground(); // Auto-sync (silenciado si offline)
      return newCategory;
    } catch (error) {
      console.error("Error creating category:", error);
      alert("No se pudo crear la categoría debido a un error de conexión.");
      return null;
    }
  };

  const handleToggleTask = async (id: string) => {
    if (!user) return;

    // Bloqueo defensivo en Web/PWA cuando no hay conexión a internet
    if (!isTauri && !isOnline) {
      alert("Sin conexión a internet. No se puede actualizar el estado de la tarea en la versión web.");
      return;
    }

    try {
      const updatedTask = await taskRepository.toggleTaskCompletion(id, user.id);
      setTasks(prev => prev.map(t => (t.id === id ? updatedTask : t)));
      
      handleSyncBackground(); // Auto-sync (silenciado si offline)
    } catch (error) {
      console.error("Error toggling task:", error);
      alert("No se pudo actualizar el estado de la tarea debido a un error de conexión.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!user) return;

    // Bloqueo defensivo en Web/PWA cuando no hay conexión a internet
    if (!isTauri && !isOnline) {
      alert("Sin conexión a internet. No se puede eliminar la tarea en la versión web.");
      return;
    }

    try {
      await taskRepository.deleteTask(id, user.id);
      setTasks(prev => prev.filter(t => t.id !== id));
      
      handleSyncBackground(); // Auto-sync (silenciado si offline)
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("No se pudo eliminar la tarea debido a un error de conexión.");
    }
  };

  const handleUpdateTask = async (id: string, updates: import('../types').UpdateTaskInput) => {
    if (!user) return;

    // Bloqueo defensivo en Web/PWA cuando no hay conexión a internet
    if (!isTauri && !isOnline) {
      alert("Sin conexión a internet. No se pueden guardar las modificaciones en la versión web.");
      return;
    }

    try {
      const updatedTask = await taskRepository.updateTask(id, updates, user.id);
      setTasks(prev => prev.map(t => (t.id === id ? updatedTask : t)));
      
      handleSyncBackground(); // Auto-sync (silenciado si offline)
    } catch (error) {
      console.error("Error updating task:", error);
      alert("No se pudo guardar la tarea debido a un error de conexión.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!user) return;

    // Bloqueo defensivo en Web/PWA cuando no hay conexión a internet
    if (!isTauri && !isOnline) {
      alert("Sin conexión a internet. No se puede eliminar la categoría en la versión web.");
      return;
    }

    try {
      await categoryRepository.deleteCategory(id, user.id);
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
      
      handleSyncBackground(); // Auto-sync (silenciado si offline)
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("No se pudo eliminar la categoría debido a un error de conexión.");
    }
  };

  const handleEmptyCompletedTasks = async () => {
    if (!user) return;

    // Bloqueo defensivo en Web/PWA cuando no hay conexión a internet
    if (!isTauri && !isOnline) {
      alert("Sin conexión a internet. No se pueden vaciar las tareas en la versión web.");
      return;
    }

    if (window.confirm("¿Seguro que quieres vaciar todas las tareas completadas?")) {
      try {
        await taskRepository.deleteAllCompletedTasks(user.id);
        setTasks(prev => prev.filter(t => t.status !== 'completed'));
        
        handleSyncBackground(); // Auto-sync (silenciado si offline)
      } catch (error) {
        console.error("Error emptying completed tasks:", error);
        alert("No se pudieron vaciar las tareas completadas debido a un error de conexión.");
      }
    }
  };

  const getFilteredTasks = () => {
    const todayStr = getLocalTodayDateString();
    let filtered = tasks.filter(task => {
      // Filtrar por categoría (ViewType = string but not a predefined view)
      if (typeof currentView === 'string' && !['all', 'today', 'upcoming', 'overdue', 'completed'].includes(currentView)) {
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

      return b.id.localeCompare(a.id);
    });
  };

  if (!user) {
    return <div style={{ padding: '20px', color: 'var(--text-muted)' }}>Cargando usuario...</div>;
  }

  if (isLoading) {
    return <div style={{ padding: '20px', color: 'var(--text-muted)' }}>Cargando datos...</div>;
  }

  const filteredTasks = getFilteredTasks();
  const showQuickAdd = currentView !== 'completed' && currentView !== 'overdue';

  let currentTitle = 'Mis Tareas';
  if (typeof currentView === 'string' && !['all', 'today', 'upcoming', 'overdue', 'completed'].includes(currentView)) {
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
        isSyncing={isSyncing}
      />

      <main className="main-content">
        <OfflineBanner isOnline={isOnline} />

        {/* ── Header ────────────────────────────────── */}
        <div className="main-header">
          <h1
            className="app-title"
            style={{
              color: typeof currentView === 'string' && !['all', 'today', 'upcoming', 'overdue', 'completed'].includes(currentView)
                ? (categories.find(c => c.id === currentView)?.color || undefined)
                : undefined
            }}
          >
            {currentTitle}
          </h1>
          {currentView === 'completed' && filteredTasks.length > 0 && (
            <button
              className="priority-btn high"
              style={{ fontSize: '12px', padding: '5px 12px' }}
              onClick={handleEmptyCompletedTasks}
            >
              Vaciar completadas
            </button>
          )}
        </div>

        {/* ── Scrollable body ───────────────────────── */}
        <div className="main-body">
          {currentView === 'listas' ? (
            <div className="category-grid-mobile">
              {categories.map(cat => {
                const catCount = tasks.filter(t => t.status !== 'completed' && t.category_id === cat.id).length;
                return (
                  <div key={cat.id} className="mobile-list-card" onClick={() => setCurrentView(cat.id)}>
                    <div className="mobile-list-card-header">
                      <div className="mobile-list-icon" style={{ backgroundColor: cat.color || 'var(--text-muted)' }}>
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"></path></svg>
                      </div>
                      <span className="mobile-list-count">{catCount}</span>
                    </div>
                    <div className="mobile-list-name">{cat.name}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* ── Mobile Bottom Nav ─────────────────────── */}
        <nav className="bottom-nav" aria-label="Navegación principal">
          {([
            { view: 'all',       label: 'Todas',      count: tasks.filter(t => t.status !== 'completed').length, icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><path d="M6 8h12M6 12h12M6 16h12"/></svg> },
            { view: 'today',     label: 'Hoy',        count: tasks.filter(t => t.status !== 'completed' && t.due_date === new Date().toISOString().slice(0,10)).length, icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
            { view: 'upcoming',  label: 'Programado', count: tasks.filter(t => t.status !== 'completed' && t.due_date && t.due_date > new Date().toISOString().slice(0,10)).length, icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { view: 'completed', label: 'Hechas',     count: 0, icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
            { view: 'listas',    label: 'Listas',     count: categories.length, icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
          ] as const).map(({ view, label, count, icon }) => (
            <button
              key={view}
              className={`bottom-nav-item ${currentView === view || (view === 'listas' && typeof currentView === 'string' && !['all', 'today', 'upcoming', 'overdue', 'completed'].includes(currentView)) ? 'active' : ''}`}
              onClick={() => setCurrentView(view)}
              aria-label={label}
            >
              <span className="bottom-nav-icon">{icon}</span>
              {count > 0 && <span className="bottom-nav-badge">{count}</span>}
              <span className="bottom-nav-label">{label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}
