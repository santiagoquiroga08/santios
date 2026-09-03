import { initDB } from '../../../services/database';
import { Category } from '../types';
import { ICategoryRepository } from '../types/repositories';

export class TauriCategoryRepository implements ICategoryRepository {
  async getCategories(userId: string): Promise<Category[]> {
    const db = await initDB();
    const rows = await db.select<Category[]>('SELECT * FROM categories WHERE deleted_at IS NULL AND user_id = $1 ORDER BY name ASC', [userId]);
    return rows;
  }

  async createCategory(name: string, color: string | null = null, userId: string): Promise<Category> {
    const db = await initDB();
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();
    await db.execute(
      'INSERT INTO categories (id, user_id, name, color, updated_at) VALUES ($1, $2, $3, $4, $5)',
      [newId, userId, name, color, now]
    );
    
    return {
      id: newId,
      user_id: userId,
      name,
      color
    };
  }

  async deleteCategory(id: string, userId: string): Promise<void> {
    const db = await initDB();
    const now = new Date().toISOString();
    // 1. Update tasks to set category_id to NULL so tasks aren't attached to a deleted category
    await db.execute('UPDATE tasks SET category_id = NULL, updated_at = $1 WHERE category_id = $2 AND user_id = $3', [now, id, userId]);
    // 2. Soft delete the category
    await db.execute('UPDATE categories SET deleted_at = $1, updated_at = $1 WHERE id = $2 AND user_id = $3', [now, id, userId]);
  }
}
