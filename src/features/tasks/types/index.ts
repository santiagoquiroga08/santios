export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  category_id?: string;
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
  category_id?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string | null;
  category_id?: string | null;
}

export interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: number;
  priority: string;
  due_date: string | null;
  category_id: string | null;
  category_name: string | null;
  category_color: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  deleted_at: string | null;
}
