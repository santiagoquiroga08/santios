import { Task } from '../features/tasks/types';
import { ViewType } from '../features/tasks/components/Sidebar';
import { getLocalTodayDateString } from '../features/tasks/utils/date';

interface BottomNavProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  tasks: Task[];
}

/**
 * Barra de navegación inferior móvil (Bottom Tabs) con las 5 vistas requeridas:
 * 1. Todas
 * 2. Hoy
 * 3. Próximas
 * 4. Hechas
 * 5. Vencidas
 */
export function BottomNav({ currentView, onViewChange, tasks }: BottomNavProps) {
  const todayStr = getLocalTodayDateString();

  const counts = {
    all: tasks.filter(t => t.status !== 'completed').length,
    today: tasks.filter(t => t.status !== 'completed' && t.due_date === todayStr).length,
    upcoming: tasks.filter(t => t.status !== 'completed' && t.due_date && t.due_date > todayStr).length,
    overdue: tasks.filter(t => t.status !== 'completed' && t.due_date && t.due_date < todayStr).length,
  };

  const tabs = [
    {
      view: 'all' as const,
      label: 'Todas',
      count: counts.all,
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" ry="2"/>
          <path d="M6 8h12M6 12h12M6 16h12"/>
        </svg>
      )
    },
    {
      view: 'today' as const,
      label: 'Hoy',
      count: counts.today,
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )
    },
    {
      view: 'upcoming' as const,
      label: 'Próximas',
      count: counts.upcoming,
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      )
    },
    {
      view: 'completed' as const,
      label: 'Hechas',
      count: 0,
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      )
    },
    {
      view: 'overdue' as const,
      label: 'Vencidas',
      count: counts.overdue,
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      )
    },
  ] as const;

  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {tabs.map(({ view, label, count, icon }) => {
        const isActive = currentView === view;
        return (
          <button
            key={view}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onViewChange(view)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="bottom-nav-icon">{icon}</span>
            {count > 0 && <span className="bottom-nav-badge">{count}</span>}
            <span className="bottom-nav-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
