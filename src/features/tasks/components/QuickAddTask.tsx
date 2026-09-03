import { useState, FormEvent } from 'react';

interface QuickAddTaskProps {
  onAdd: (title: string) => Promise<void>;
}

export function QuickAddTask({ onAdd }: QuickAddTaskProps) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mantenemos autoFocus solo para escritorio (mejora la UX en PC sin afectar el móvil)
  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 768;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (title.trim() && !isSubmitting) {
      setIsSubmitting(true);
      await onAdd(title.trim());
      setTitle('');
      setIsSubmitting(false);
    }
  };

  return (
    <form className="quick-add-container" onSubmit={handleSubmit}>
      <input
        type="text"
        className="quick-add-input"
        placeholder="+ ¿Qué necesitas hacer?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isSubmitting}
        autoFocus={isDesktop}
      />
      {/* Botón submit oculto para asegurar la compatibilidad máxima en teclados iOS */}
      <button type="submit" style={{ display: 'none' }}>Agregar</button>
    </form>
  );
}
