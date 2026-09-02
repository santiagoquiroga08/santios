export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Category {
  id: number;
  name: string;
  color: string | null;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  category_id?: number;
  category_name?: string;
  category_color?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string;
  category_id?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string | null;
  category_id?: number | null;
}

export interface TaskRow {
  id: number;
  title: string;
  description: string | null;
  completed: number;
  priority: string;
  due_date: string | null;
  category_id: number | null;
  category_name: string | null;
  category_color: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}
