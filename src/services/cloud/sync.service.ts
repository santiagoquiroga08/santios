import { tursoClient } from './tursoClient';
import { initDB } from '../../services/database';

export class SyncService {
  static async syncAll(userId: string) {
    console.log("Iniciando sincronización bidireccional para usuario:", userId);
    const syncKey = `last_sync_at_${userId}`;
    const lastSyncStr = localStorage.getItem(syncKey) || '1970-01-01T00:00:00.000Z';
    const currentSyncTime = new Date().toISOString();

    const localDb = await initDB();

    try {
      // ==========================================
      // 1. PULL (De Turso a Local)
      // ==========================================
      console.log(`PULL: Descargando cambios desde Turso (después de ${lastSyncStr})...`);
      
      // -- PULL Categories --
      const remoteCategories = await tursoClient.execute({
        sql: 'SELECT * FROM categories WHERE user_id = ? AND updated_at > ?',
        args: [userId, lastSyncStr]
      });

      for (const row of remoteCategories.rows) {
        await localDb.execute(
          `INSERT INTO categories (id, user_id, name, color, updated_at, deleted_at) 
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT(id) DO UPDATE SET 
             name = excluded.name, 
             color = excluded.color, 
             updated_at = excluded.updated_at,
             deleted_at = excluded.deleted_at`,
          [row.id, row.user_id, row.name, row.color, row.updated_at, row.deleted_at]
        );
      }
      
      // -- PULL Tasks --
      const remoteTasks = await tursoClient.execute({
        sql: 'SELECT * FROM tasks WHERE user_id = ? AND updated_at > ?',
        args: [userId, lastSyncStr]
      });

      for (const row of remoteTasks.rows) {
        await localDb.execute(
          `INSERT INTO tasks (id, user_id, title, description, completed, priority, due_date, created_at, updated_at, completed_at, deleted_at, category_id) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT(id) DO UPDATE SET 
             title = excluded.title, 
             description = excluded.description, 
             completed = excluded.completed, 
             priority = excluded.priority, 
             due_date = excluded.due_date, 
             updated_at = excluded.updated_at, 
             completed_at = excluded.completed_at, 
             deleted_at = excluded.deleted_at, 
             category_id = excluded.category_id`,
          [
            row.id, row.user_id, row.title, row.description, row.completed, 
            row.priority, row.due_date, row.created_at, row.updated_at, 
            row.completed_at, row.deleted_at, row.category_id
          ]
        );
      }

      // ==========================================
      // 2. PUSH (De Local a Turso)
      // ==========================================
      console.log("PUSH: Subiendo cambios locales a Turso...");
      
      // -- PUSH Categories --
      const localCategories = await localDb.select<any[]>(
        'SELECT * FROM categories WHERE user_id = $1 AND updated_at > $2',
        [userId, lastSyncStr]
      );

      for (const cat of localCategories) {
        await tursoClient.execute({
          sql: `INSERT INTO categories (id, user_id, name, color, updated_at, deleted_at) 
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET 
                  name = excluded.name, 
                  color = excluded.color, 
                  updated_at = excluded.updated_at,
                  deleted_at = excluded.deleted_at`,
          args: [cat.id, cat.user_id, cat.name, cat.color, cat.updated_at, cat.deleted_at]
        });
      }

      // -- PUSH Tasks --
      const localTasks = await localDb.select<any[]>(
        'SELECT * FROM tasks WHERE user_id = $1 AND updated_at > $2',
        [userId, lastSyncStr]
      );

      for (const task of localTasks) {
        await tursoClient.execute({
          sql: `INSERT INTO tasks (id, user_id, title, description, completed, priority, due_date, created_at, updated_at, completed_at, deleted_at, category_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET 
                  title = excluded.title, 
                  description = excluded.description, 
                  completed = excluded.completed, 
                  priority = excluded.priority, 
                  due_date = excluded.due_date, 
                  updated_at = excluded.updated_at, 
                  completed_at = excluded.completed_at, 
                  deleted_at = excluded.deleted_at, 
                  category_id = excluded.category_id`,
          args: [
            task.id, task.user_id, task.title, task.description, task.completed, 
            task.priority, task.due_date, task.created_at, task.updated_at, 
            task.completed_at, task.deleted_at, task.category_id
          ]
        });
      }

      // ==========================================
      // 3. Finalizar
      // ==========================================
      localStorage.setItem(syncKey, currentSyncTime);
      console.log("✅ Sincronización completada exitosamente.");
    } catch (error) {
      console.error("❌ Error durante la sincronización:", error);
      throw error;
    }
  }
}
