import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Task, UpdateTaskInput, TaskPriority } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, updates: UpdateTaskInput) => void;
}

export function TaskItem({ task, onToggle, onDelete, onUpdate }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [isExpanded, setIsExpanded] = useState(false);
  const [descText, setDescText] = useState(task.description || '');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const isCompleted = task.status === 'completed';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setDescText(task.description || '');
  }, [task.description]);

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

        <div className="task-actions">
          <button 
            className={`task-action-btn expand ${isExpanded ? 'active' : ''}`} 
            onClick={() => setIsExpanded(!isExpanded)}
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
          <textarea
            className="task-desc-input"
            value={descText}
            onChange={(e) => setDescText(e.target.value)}
            onBlur={handleDescBlur}
            placeholder="Añadir descripción... (guardado automático al perder foco)"
            rows={2}
          />
          <div className="task-priority-selector">
            <span className="priority-label">Prioridad:</span>
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
        </div>
      )}
    </div>
  );
}
