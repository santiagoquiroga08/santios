import { useState, KeyboardEvent } from 'react';

interface QuickAddTaskProps {
  onAdd: (title: string) => Promise<void>;
}

export function QuickAddTask({ onAdd }: QuickAddTaskProps) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && title.trim() && !isSubmitting) {
      setIsSubmitting(true);
      await onAdd(title.trim());
      setTitle('');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="quick-add-container">
      <input
        type="text"
        className="quick-add-input"
        placeholder="+ ¿Qué necesitas hacer?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSubmitting}
        autoFocus
      />
    </div>
  );
}
