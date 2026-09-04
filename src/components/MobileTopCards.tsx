import { Category, Task } from '../features/tasks/types';
import { ViewType } from '../features/tasks/components/Sidebar';

interface MobileTopCardsProps {
  categories: Category[];
  tasks: Task[];
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onCreateCategory?: (name: string, color?: string | null) => Promise<Category | null>;
}

/**
 * Cuadrícula de 4 tarjetas superiores en la versión móvil:
 * - Tarjetas 1 a 3: Corresponden dinámicamente a las 3 primeras categorías.
 * - Tarjeta 4: Acceso directo / botón a la sección dedicada para ver todas las categorías ('listas').
 */
export function MobileTopCards({
  categories,
  tasks,
  currentView,
  onViewChange,
  onCreateCategory,
}: MobileTopCardsProps) {
  const topCategories = categories.slice(0, 3);

  const handleCreatePrompt = async () => {
    const name = window.prompt('Nombre de la nueva lista:');
    if (name && name.trim()) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const newCat = await onCreateCategory?.(name.trim(), randomColor);
      if (newCat) {
        onViewChange(newCat.id);
      }
    }
  };

  return (
    <div className="mobile-top-cards" aria-label="Categorías destacadas">
      {/* Primeras 3 tarjetas dinámicas */}
      {[0, 1, 2].map(index => {
        const cat = topCategories[index];

        if (cat) {
          const catCount = tasks.filter(
            t => t.status !== 'completed' && t.category_id === cat.id
          ).length;
          const isActive = currentView === cat.id;

          return (
            <div
              key={cat.id}
              className={`mobile-top-card ${isActive ? 'active' : ''}`}
              onClick={() => onViewChange(cat.id)}
              role="button"
              tabIndex={0}
              aria-label={`Lista ${cat.name}, ${catCount} tareas`}
            >
              <div className="mobile-top-card-header">
                <div
                  className="mobile-top-card-icon"
                  style={{ backgroundColor: cat.color || 'var(--text-muted)' }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                </div>
                <span className="mobile-top-card-count">{catCount}</span>
              </div>
              <div className="mobile-top-card-name" title={cat.name}>{cat.name}</div>
            </div>
          );
        }

        // Slot para crear lista si hay menos de 3 categorías
        return (
          <div
            key={`placeholder-${index}`}
            className="mobile-top-card empty-slot"
            onClick={handleCreatePrompt}
            role="button"
            tabIndex={0}
            aria-label="Crear nueva lista"
          >
            <div className="mobile-top-card-header">
              <div
                className="mobile-top-card-icon"
                style={{ backgroundColor: 'var(--bg-surface-raised)', border: '1px dashed var(--border-input)' }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
            </div>
            <div className="mobile-top-card-name text-muted" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>+ Nueva lista</div>
          </div>
        );
      })}

      {/* 4ª tarjeta: Acceso directo a todas las categorías */}
      <div
        className={`mobile-top-card card-all-lists ${currentView === 'listas' ? 'active' : ''}`}
        onClick={() => onViewChange('listas')}
        role="button"
        tabIndex={0}
        aria-label="Ver todas las listas"
      >
        <div className="mobile-top-card-header">
          <div
            className="mobile-top-card-icon"
            style={{ background: 'linear-gradient(135deg, var(--accent) 0%, #c084fc 100%)' }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <span className="mobile-top-card-count">{categories.length}</span>
        </div>
        <div className="mobile-top-card-name">Todas las listas</div>
      </div>
    </div>
  );
}

export default MobileTopCards;
