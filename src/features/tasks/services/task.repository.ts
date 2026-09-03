import { initDB } from '../../../services/database';
import { Task, CreateTaskInput, UpdateTaskInput, TaskRow } from '../types';
import { ITaskRepository } from '../types/repositories';

/**
 * TauriTaskRepository
 * 
 * Encapsulates all SQLite database operations for Tasks via Tauri.
 */
export class TauriTaskRepository implements ITaskRepository {
  private async getDb() {
    return await initDB();
  }

  private mapRowToTask(row: TaskRow): Task {
    return {
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      description: row.description || undefined,
      status: row.completed === 1 ? 'completed' : 'pending',
      priority: row.priority as Task['priority'],
      due_date: row.due_date || undefined,
      category_id: row.category_id || undefined,
      category_name: row.category_name || undefined,
      category_color: row.category_color || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
      completed_at: row.completed_at || undefined,
    };
  }

  public async getTasks(userId: string): Promise<Task[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<TaskRow[]>(`
        SELECT t.*, c.name as category_name, c.color as category_color 
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.deleted_at IS NULL AND t.user_id = $1
        ORDER BY t.created_at DESC
      `, [userId]);
      return rows.map((row) => this.mapRowToTask(row));
    } catch (error) {
      throw new Error(`Failed to fetch tasks: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async getTaskById(id: string, userId: string): Promise<Task> {
    try {
      const db = await this.getDb();
      const rows = await db.select<TaskRow[]>(`
        SELECT t.*, c.name as category_name, c.color as category_color 
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.id = $1 AND t.user_id = $2 AND t.deleted_at IS NULL
      `, [id, userId]);
      if (rows.length === 0) {
        throw new Error(`Task with ID ${id} not found`);
      }
      return this.mapRowToTask(rows[0]);
    } catch (error) {
      throw new Error(`Failed to fetch task ${id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async createTask(input: CreateTaskInput, userId: string): Promise<Task> {
    try {
      const db = await this.getDb();
      const now = new Date().toISOString();
      const priority = input.priority || 'medium';
      const newId = crypto.randomUUID();

      await db.execute(
        `INSERT INTO tasks (id, user_id, title, description, priority, due_date, category_id, created_at, updated_at, completed) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0)`,
        [
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
      );
      
      return await this.getTaskById(newId, userId);
    } catch (error) {
      throw new Error(`Failed to create task: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async updateTask(id: string, input: UpdateTaskInput, userId: string): Promise<Task> {
    try {
      const db = await this.getDb();
      const now = new Date().toISOString();
      
      const currentTask = await this.getTaskById(id, userId);

      const newTitle = input.title !== undefined ? input.title : currentTask.title;
      const newDescription = input.description !== undefined ? input.description : (currentTask.description || null);
      const newPriority = input.priority !== undefined ? input.priority : currentTask.priority;
      const newDueDate = input.due_date !== undefined ? input.due_date : (currentTask.due_date || null);
      const newCategoryId = input.category_id !== undefined ? input.category_id : (currentTask.category_id || null);

      await db.execute(
        `UPDATE tasks 
         SET title = $1, description = $2, priority = $3, due_date = $4, category_id = $5, updated_at = $6 
         WHERE id = $7 AND user_id = $8`,
        [newTitle, newDescription, newPriority, newDueDate, newCategoryId, now, id, userId]
      );

      return await this.getTaskById(id, userId);
    } catch (error) {
      throw new Error(`Failed to update task ${id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async toggleTaskCompletion(id: string, userId: string): Promise<Task> {
    try {
      const db = await this.getDb();
      const currentTask = await this.getTaskById(id, userId);
      const now = new Date().toISOString();
      
      const isCurrentlyCompleted = currentTask.status === 'completed';
      const newCompletedState = isCurrentlyCompleted ? 0 : 1;
      const newCompletedAt = isCurrentlyCompleted ? null : now;

      await db.execute(
        `UPDATE tasks 
         SET completed = $1, completed_at = $2, updated_at = $3 
         WHERE id = $4 AND user_id = $5`,
        [newCompletedState, newCompletedAt, now, id, userId]
      );

      return await this.getTaskById(id, userId);
    } catch (error) {
      throw new Error(`Failed to toggle task ${id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async deleteTask(id: string, userId: string): Promise<void> {
    try {
      const db = await this.getDb();
      const now = new Date().toISOString();
      await db.execute('UPDATE tasks SET deleted_at = $1, updated_at = $1 WHERE id = $2 AND user_id = $3', [now, id, userId]);
    } catch (error) {
      throw new Error(`Failed to delete task ${id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async deleteAllCompletedTasks(userId: string): Promise<void> {
    try {
      const db = await this.getDb();
      const now = new Date().toISOString();
      await db.execute('UPDATE tasks SET deleted_at = $1, updated_at = $1 WHERE completed = 1 AND deleted_at IS NULL AND user_id = $2', [now, userId]);
    } catch (error) {
      throw new Error(`Failed to delete completed tasks: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
