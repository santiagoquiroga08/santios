import { Task, Category } from '../types';
import { getLocalTodayDateString } from '../utils/date';
import { initCloudSchema } from '../../../services/cloud/schema';

export type ViewType = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed' | 'listas' | string;

interface SidebarProps {
  currentView: ViewType;
  tasks: Task[];
  categories: Category[];
  onViewChange: (view: ViewType) => void;
  onDeleteCategory?: (id: string) => void;
  isSyncing?: boolean;
}

export function Sidebar({ currentView, tasks, categories, onViewChange, onDeleteCategory, isSyncing }: SidebarProps) {
  const todayStr = getLocalTodayDateString();

  // Calcular contadores
  const counts = {
    today: tasks.filter(t => t.status !== 'completed' && t.due_date === todayStr).length,
    upcoming: tasks.filter(t => t.status !== 'completed' && t.due_date && t.due_date > todayStr).length,
    overdue: tasks.filter(t => t.status !== 'completed' && t.due_date && t.due_date < todayStr).length,
    all: tasks.filter(t => t.status !== 'completed').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Â¿Eliminar esta categorÃ­a? Las tareas no se borrarÃ¡n.')) {
      onDeleteCategory?.(id);
    }
  };

  const handleInitTurso = async () => {
    try {
      await initCloudSchema();
      // Como reiniciamos la base de datos remota, debemos forzar a que la prÃ³xima 
      // sincronizaciÃ³n sea total desde cero. Para ello, borramos los timestamps.
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('last_sync_at_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      
      alert('Â¡Esquema creado en Turso exitosamente! (Timestamp de sync reseteado)');
    } catch (error) {
      alert('Error al inicializar Turso: ' + String(error));
    }
  };

  return (
    <aside className="sidebar">
      {/* â”€â”€ Wordmark â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="sidebar-wordmark">
        <div className="sidebar-logo">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1.5" fill="white" opacity="0.9"/>
            <rect x="9" y="2" width="5" height="5" rx="1.5" fill="white" opacity="0.6"/>
            <rect x="2" y="9" width="5" height="5" rx="1.5" fill="white" opacity="0.6"/>
            <rect x="9" y="9" width="5" height="5" rx="1.5" fill="white" opacity="0.3"/>
          </svg>
        </div>
        <span className="sidebar-app-name">Santios</span>
      </div>

      {/* â”€â”€ Smart Views Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="sidebar-global-grid">
        <div
          className={`global-card card-today ${currentView === 'today' ? 'active' : ''}`}
          onClick={() => onViewChange('today')}
        >
          <div className="global-card-header">
            <div className="global-card-icon bg-blue">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <span className="global-card-count">{counts.today}</span>
          </div>
          <div className="global-card-title">Hoy</div>
        </div>

        <div
          className={`global-card card-upcoming ${currentView === 'upcoming' ? 'active' : ''}`}
          onClick={() => onViewChange('upcoming')}
        >
          <div className="global-card-header">
            <div className="global-card-icon bg-orange">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <span className="global-card-count">{counts.upcoming}</span>
          </div>
          <div className="global-card-title">PrÃ³ximas</div>
        </div>

        <div
          className={`global-card card-overdue ${currentView === 'overdue' ? 'active' : ''}`}
          onClick={() => onViewChange('overdue')}
        >
          <div className="global-card-header">
            <div className="global-card-icon bg-red">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <span className="global-card-count">{counts.overdue}</span>
          </div>
          <div className="global-card-title">Vencidas</div>
        </div>

        <div
          className={`global-card card-all ${currentView === 'all' ? 'active' : ''}`}
          onClick={() => onViewChange('all')}
        >
          <div className="global-card-header">
            <div className="global-card-icon bg-gray-dark">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </div>
            <span className="global-card-count">{counts.all}</span>
          </div>
          <div className="global-card-title">Todas</div>
        </div>

        <div
          className={`global-card card-completed ${currentView === 'completed' ? 'active' : ''}`}
          onClick={() => onViewChange('completed')}
        >
          <div className="global-card-header">
            <div className="global-card-icon bg-gray-light">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span className="global-card-count">{counts.completed}</span>
          </div>
          <div className="global-card-title">Listas</div>
        </div>
      </div>

      {/* â”€â”€ My Lists â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="sidebar-lists-section">
        <h2 className="sidebar-section-title">Mis listas</h2>
        <nav className="sidebar-nav">
          {categories.map(cat => {
            const catCount = tasks.filter(t => t.status !== 'completed' && t.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                className={`sidebar-nav-item ${currentView === cat.id ? 'active' : ''}`}
                onClick={() => onViewChange(cat.id)}
              >
                <span
                  className="sidebar-category-dot"
                  style={{ backgroundColor: cat.color || 'var(--text-muted)' }}
                />
                <span className="sidebar-category-name">{cat.name}</span>
                <span className="sidebar-category-count">{catCount}</span>
                {onDeleteCategory && (
                  <div
                    className="sidebar-delete-btn"
                    onClick={(e) => handleDelete(e, cat.id)}
                    title="Eliminar lista"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* â”€â”€ Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="sidebar-version">v1.0.0 Â· @ilegalsantiago</span>
          <div className={`cloud-status ${isSyncing ? 'syncing' : 'synced'}`} title={isSyncing ? 'Sincronizandoâ€¦' : 'Sincronizado'}>
            <span className={`cloud-dot ${isSyncing ? 'syncing' : ''}`} />
            {isSyncing ? 'Syncâ€¦' : 'Synced'}
          </div>
        </div>
        <button onClick={handleInitTurso} className="sidebar-action-btn">
          â˜ Init Turso schema
        </button>
      </div>
    </aside>
  );
}
