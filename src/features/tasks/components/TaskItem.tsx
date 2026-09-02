import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Task, Category, UpdateTaskInput, TaskPriority } from '../types';
import { getLocalTodayDateString } from '../utils/date';
import { open } from '@tauri-apps/plugin-shell';

interface TaskItemProps {
  task: Task;
  categories: Category[];
  autoExpand?: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, updates: UpdateTaskInput) => void;
  onCreateCategory: (name: string, color?: string | null) => Promise<Category | null>;
  onClearAutoExpand: () => void;
}

export function TaskItem({ task, categories, autoExpand, onToggle, onDelete, onUpdate, onCreateCategory, onClearAutoExpand }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isExpanded, setIsExpanded] = useState(autoExpand || false);
  const [isDescEditing, setIsDescEditing] = useState(false);
  const [descText, setDescText] = useState(task.description || '');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const isCompleted = task.status === 'completed';
  const todayStr = getLocalTodayDateString();
  const isOverdue = !isCompleted && task.due_date && task.due_date < todayStr;

  const renderDescription = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              open(part);
            }}
            style={{ color: 'var(--accent-color)', textDecoration: 'underline' }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setDescText(task.description || '');
  }, [task.description]);

  useEffect(() => {
    if (autoExpand) {
      setIsExpanded(true);
      setTimeout(() => {
        if (descRef.current) {
          descRef.current.focus();
        }
      }, 50);
    }
  }, [autoExpand]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditTitle(task.title);
  };

  const handleTitleSave = () => {
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdate(task.id, { title: trimmed });
    } else {
      setEditTitle(task.title); // restaurar si está vacío
    }
    setIsEditing(false);
  };

  const handleTitleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setEditTitle(task.title); // cancelar
      setIsEditing(false);
    }
  };

  const handleDescBlur = () => {
    const trimmed = descText.trim();
    const currentDesc = task.description || '';
    if (trimmed !== currentDesc) {
      onUpdate(task.id, { description: trimmed || undefined });
    }
  };

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'new') {
      const name = window.prompt("Nombre de la nueva categoría:");
      if (name && name.trim()) {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const newCat = await onCreateCategory(name.trim(), randomColor);
        if (newCat) {
          onUpdate(task.id, { category_id: newCat.id });
        }
      }
    } else if (val === 'none') {
      onUpdate(task.id, { category_id: null });
    } else {
      onUpdate(task.id, { category_id: parseInt(val, 10) });
    }
  };

  return (
    <div className={`task-item ${isCompleted ? 'completed' : ''}`}>
      <div className="task-item-header">
        <div className="task-item-content">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={() => onToggle(task.id)}
            className="task-checkbox"
          />
          
          <div className="task-title-wrapper">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`task-priority-dot ${task.priority}`} title={`Prioridad ${task.priority}`}></div>
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  className="task-inline-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyDown}
                />
              ) : (
                <span 
                  className="task-title" 
                  onDoubleClick={handleDoubleClick}
                  title="Doble clic para editar"
                >
                  {task.title}
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
              {task.due_date && (
                <span className={`task-due-badge ${isOverdue ? 'text-danger' : ''}`} style={{ marginTop: 0 }}>
                  <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  {task.due_date}
                </span>
              )}
              {task.category_id && task.category_name && (
                <span 
                  className="task-category-chip"
                  style={task.category_color ? { borderColor: task.category_color, color: task.category_color, backgroundColor: 'transparent' } : undefined}
                >
                  {task.category_name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="task-actions">
          <button 
            className={`task-action-btn expand ${isExpanded ? 'active' : ''}`} 
            onClick={() => {
              const newExpandedState = !isExpanded;
              setIsExpanded(newExpandedState);
              if (!newExpandedState && autoExpand) {
                onClearAutoExpand();
              }
            }}
            title="Detalles"
            aria-label="Detalles de la tarea"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          <button 
            className="task-action-btn delete" 
            onClick={() => onDelete(task.id)}
            aria-label="Eliminar tarea"
            title="Eliminar tarea"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="task-details-panel">
          {isDescEditing ? (
            <textarea
              ref={descRef}
              className="task-desc-input"
              value={descText}
              onChange={(e) => setDescText(e.target.value)}
              onBlur={() => {
                handleDescBlur();
                setIsDescEditing(false);
              }}
              placeholder="Añadir descripción... (guardado automático al perder foco)"
              rows={2}
            />
          ) : (
            <div 
              className="task-desc-readonly" 
              onClick={() => setIsDescEditing(true)}
              style={{ padding: '8px 12px', minHeight: '40px', fontSize: '14px', color: descText ? 'var(--text-secondary)' : 'var(--text-muted)', cursor: 'text', border: '1px solid transparent', whiteSpace: 'pre-wrap' }}
            >
              {descText ? renderDescription(descText) : 'Añadir descripción...'}
            </div>
          )}
          
          <div className="task-options-row">
            <div className="task-priority-selector">
              <span className="detail-label">Prioridad:</span>
              <div className="priority-options">
                {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    className={`priority-btn ${p} ${task.priority === p ? 'active' : ''}`}
                    onClick={() => onUpdate(task.id, { priority: p })}
                  >
                    {p === 'low' ? 'Baja' : p === 'medium' ? 'Media' : 'Alta'}
                  </button>
                ))}
              </div>
            </div>

            <div className="task-due-selector">
              <span className="detail-label">Vence:</span>
              <input 
                type="date" 
                className="task-date-input" 
                value={task.due_date || ''}
                onChange={(e) => onUpdate(task.id, { due_date: e.target.value || null })}
              />
            </div>
            
            <div className="task-category-selector">
              <span className="detail-label">Categoría:</span>
              <select 
                className="task-category-select" 
                value={task.category_id || 'none'} 
                onChange={handleCategoryChange}
              >
                <option value="none">Sin categoría</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value="new">+ Crear nueva...</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
