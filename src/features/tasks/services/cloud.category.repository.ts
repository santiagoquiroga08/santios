import { Category } from '../types';
import { ICategoryRepository } from '../types/repositories';
import { tursoClient } from '../../../services/cloud/tursoClient';
import { generateId } from '../../../utils/uuid';

export class CloudCategoryRepository implements ICategoryRepository {
  async getCategories(userId: string): Promise<Category[]> {
    const result = await tursoClient.execute({
      sql: 'SELECT * FROM categories WHERE deleted_at IS NULL AND user_id = ? ORDER BY name ASC',
      args: [userId]
    });
    
    return result.rows.map(row => ({
      id: row.id as string,
      user_id: row.user_id as string,
      name: row.name as string,
      color: row.color as string | null
    }));
  }

  async createCategory(name: string, color: string | null = null, userId: string): Promise<Category> {
    const newId = generateId();
    const now = new Date().toISOString();
    
    await tursoClient.execute({
      sql: 'INSERT INTO categories (id, user_id, name, color, updated_at) VALUES (?, ?, ?, ?, ?)',
      args: [newId, userId, name, color, now]
    });
    
    return {
      id: newId,
      user_id: userId,
      name,
      color
    };
  }

  async deleteCategory(id: string, userId: string): Promise<void> {
    const now = new Date().toISOString();
    
    // 1. Update tasks to set category_id to NULL so tasks aren't attached to a deleted category
    await tursoClient.execute({
      sql: 'UPDATE tasks SET category_id = NULL, updated_at = ? WHERE category_id = ? AND user_id = ?',
      args: [now, id, userId]
    });
    
    // 2. Soft delete the category
    await tursoClient.execute({
      sql: 'UPDATE categories SET deleted_at = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      args: [now, now, id, userId]
    });
  }
}
