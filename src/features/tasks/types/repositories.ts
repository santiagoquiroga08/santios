import { Task, Category, CreateTaskInput, UpdateTaskInput } from './index';

export interface ITaskRepository {
  getTasks(userId: string): Promise<Task[]>;
  getTaskById(id: string, userId: string): Promise<Task>;
  createTask(input: CreateTaskInput, userId: string): Promise<Task>;
  updateTask(id: string, input: UpdateTaskInput, userId: string): Promise<Task>;
  toggleTaskCompletion(id: string, userId: string): Promise<Task>;
  deleteTask(id: string, userId: string): Promise<void>;
  deleteAllCompletedTasks(userId: string): Promise<void>;
}

export interface ICategoryRepository {
  getCategories(userId: string): Promise<Category[]>;
  createCategory(name: string, color: string | null, userId: string): Promise<Category>;
  deleteCategory(id: string, userId: string): Promise<void>;
}
