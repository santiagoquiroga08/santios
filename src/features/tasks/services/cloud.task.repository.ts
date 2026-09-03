import { Task, CreateTaskInput, UpdateTaskInput } from '../types';
import { ITaskRepository } from '../types/repositories';
import { tursoClient } from '../../../services/cloud/tursoClient';
import { generateId } from '../../../utils/uuid';

export class CloudTaskRepository implements ITaskRepository {
  private mapRowToTask(row: any): Task {
    return {
      id: row.id as string,
      user_id: row.user_id as string,
      title: row.title as string,
      description: row.description ? (row.description as string) : undefined,
      status: row.completed === 1 || row.completed === true ? 'completed' : 'pending',
      priority: row.priority as Task['priority'],
      due_date: row.due_date ? (row.due_date as string) : undefined,
      category_id: row.category_id ? (row.category_id as string) : undefined,
      category_name: row.category_name ? (row.category_name as string) : undefined,
      category_color: row.category_color ? (row.category_color as string) : undefined,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      completed_at: row.completed_at ? (row.completed_at as string) : undefined,
    };
  }

  public async getTasks(userId: string): Promise<Task[]> {
    const result = await tursoClient.execute({
      sql: `
        SELECT t.*, c.name as category_name, c.color as category_color 
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.deleted_at IS NULL AND t.user_id = ?
        ORDER BY t.created_at DESC
      `,
      args: [userId]
    });
    return result.rows.map((row) => this.mapRowToTask(row));
  }

  public async getTaskById(id: string, userId: string): Promise<Task> {
    const result = await tursoClient.execute({
      sql: `
        SELECT t.*, c.name as category_name, c.color as category_color 
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.id = ? AND t.user_id = ? AND t.deleted_at IS NULL
      `,
      args: [id, userId]
    });
    if (result.rows.length === 0) {
      throw new Error(`Task with ID ${id} not found`);
    }
    return this.mapRowToTask(result.rows[0]);
  }

  public async createTask(input: CreateTaskInput, userId: string): Promise<Task> {
    const now = new Date().toISOString();
    const priority = input.priority || 'medium';
    const newId = generateId();

    await tursoClient.execute({
      sql: `INSERT INTO tasks (id, user_id, title, description, priority, due_date, category_id, created_at, updated_at, completed) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      args: [
        newId,
        userId,
        input.title,
        input.description || null,
        priority,
        input.due_date || null,
        input.category_id || null,
        now,
        now
      ]
    });
    
    return await this.getTaskById(newId, userId);
  }

  public async updateTask(id: string, input: UpdateTaskInput, userId: string): Promise<Task> {
    const now = new Date().toISOString();
    const currentTask = await this.getTaskById(id, userId);

    const newTitle = input.title !== undefined ? input.title : currentTask.title;
    const newDescription = input.description !== undefined ? input.description : (currentTask.description || null);
    const newPriority = input.priority !== undefined ? input.priority : currentTask.priority;
    const newDueDate = input.due_date !== undefined ? input.due_date : (currentTask.due_date || null);
    const newCategoryId = input.category_id !== undefined ? input.category_id : (currentTask.category_id || null);

    await tursoClient.execute({
      sql: `UPDATE tasks 
            SET title = ?, description = ?, priority = ?, due_date = ?, category_id = ?, updated_at = ? 
            WHERE id = ? AND user_id = ?`,
      args: [newTitle, newDescription, newPriority, newDueDate, newCategoryId, now, id, userId]
    });

    return await this.getTaskById(id, userId);
  }

  public async toggleTaskCompletion(id: string, userId: string): Promise<Task> {
    const currentTask = await this.getTaskById(id, userId);
    const now = new Date().toISOString();
    
    const isCurrentlyCompleted = currentTask.status === 'completed';
    const newCompletedState = isCurrentlyCompleted ? 0 : 1;
    const newCompletedAt = isCurrentlyCompleted ? null : now;

    await tursoClient.execute({
      sql: `UPDATE tasks 
            SET completed = ?, completed_at = ?, updated_at = ? 
            WHERE id = ? AND user_id = ?`,
      args: [newCompletedState, newCompletedAt, now, id, userId]
    });

    return await this.getTaskById(id, userId);
  }

  public async deleteTask(id: string, userId: string): Promise<void> {
    const now = new Date().toISOString();
    await tursoClient.execute({
      sql: 'UPDATE tasks SET deleted_at = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      args: [now, now, id, userId]
    });
  }

  public async deleteAllCompletedTasks(userId: string): Promise<void> {
    const now = new Date().toISOString();
    await tursoClient.execute({
      sql: 'UPDATE tasks SET deleted_at = ?, updated_at = ? WHERE completed = 1 AND deleted_at IS NULL AND user_id = ?',
      args: [now, now, userId]
    });
  }
}
