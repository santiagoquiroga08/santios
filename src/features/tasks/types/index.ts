export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string;
}

export interface TaskRow {
  id: number;
  title: string;
  description: string | null;
  completed: number;
  priority: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}
