import { initDB } from '../../../services/database';
import { Task, CreateTaskInput, UpdateTaskInput, TaskRow } from '../types';

/**
 * TaskRepository
 * 
 * Encapsulates all SQLite database operations for Tasks.
 * This ensures that React components don't execute SQL directly.
 */
export class TaskRepository {
  /**
   * Obtiene la instancia de la base de datos de manera segura.
   */
  public static async getDb() {
    return await initDB();
  }

  /**
   * Mapea una fila de SQLite al modelo TypeScript.
   */
  private static mapRowToTask(row: TaskRow): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      status: row.completed === 1 ? 'completed' : 'pending',
      priority: row.priority as Task['priority'],
      due_date: row.due_date || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
      completed_at: row.completed_at || undefined,
    };
  }

  public static async getTasks(): Promise<Task[]> {
    try {
      const db = await this.getDb();
      const rows = await db.select<TaskRow[]>('SELECT * FROM tasks ORDER BY created_at DESC');
      return rows.map(this.mapRowToTask);
    } catch (error) {
      throw new Error(`Failed to fetch tasks: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public static async getTaskById(id: number): Promise<Task> {
    try {
      const db = await this.getDb();
      const rows = await db.select<TaskRow[]>('SELECT * FROM tasks WHERE id = $1', [id]);
      if (rows.length === 0) {
        throw new Error(`Task with ID ${id} not found`);
      }
      return this.mapRowToTask(rows[0]);
    } catch (error) {
      throw new Error(`Failed to fetch task ${id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public static async createTask(input: CreateTaskInput): Promise<Task> {
    try {
      const db = await this.getDb();
      const now = new Date().toISOString();
      const priority = input.priority || 'medium';

      const result = await db.execute(
        `INSERT INTO tasks (title, description, priority, due_date, created_at, updated_at, completed) 
         VALUES ($1, $2, $3, $4, $5, $6, 0)`,
        [
          input.title,
          input.description || null,
          priority,
          input.due_date || null,
          now,
          now
        ]
      );
      
      return await this.getTaskById(result.lastInsertId as number);
    } catch (error) {
      throw new Error(`Failed to create task: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public static async updateTask(id: number, input: UpdateTaskInput): Promise<Task> {
    try {
      const db = await this.getDb();
      const now = new Date().toISOString();
      
      // Obtener tarea actual para no sobreescribir con nulls accidentalmente
      const currentTask = await this.getTaskById(id);

      const newTitle = input.title !== undefined ? input.title : currentTask.title;
      const newDescription = input.description !== undefined ? input.description : (currentTask.description || null);
      const newPriority = input.priority !== undefined ? input.priority : currentTask.priority;
      const newDueDate = input.due_date !== undefined ? input.due_date : (currentTask.due_date || null);

      await db.execute(
        `UPDATE tasks 
         SET title = $1, description = $2, priority = $3, due_date = $4, updated_at = $5 
         WHERE id = $6`,
        [newTitle, newDescription, newPriority, newDueDate, now, id]
      );

      return await this.getTaskById(id);
    } catch (error) {
      throw new Error(`Failed to update task ${id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public static async toggleTaskCompletion(id: number): Promise<Task> {
    try {
      const db = await this.getDb();
      const currentTask = await this.getTaskById(id);
      const now = new Date().toISOString();
      
      const isCurrentlyCompleted = currentTask.status === 'completed';
      const newCompletedState = isCurrentlyCompleted ? 0 : 1;
      const newCompletedAt = isCurrentlyCompleted ? null : now;

      await db.execute(
        `UPDATE tasks 
         SET completed = $1, completed_at = $2, updated_at = $3 
         WHERE id = $4`,
        [newCompletedState, newCompletedAt, now, id]
      );

      return await this.getTaskById(id);
    } catch (error) {
      throw new Error(`Failed to toggle task ${id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public static async deleteTask(id: number): Promise<void> {
    try {
      const db = await this.getDb();
      await db.execute('DELETE FROM tasks WHERE id = $1', [id]);
    } catch (error) {
      throw new Error(`Failed to delete task ${id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
