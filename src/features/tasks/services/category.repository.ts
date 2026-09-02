import { initDB } from '../../../services/database';
import { Category } from '../types';

export class CategoryRepository {
  static async getCategories(): Promise<Category[]> {
    const db = await initDB();
    const rows = await db.select<Category[]>('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  }

  static async createCategory(name: string, color: string | null = null): Promise<Category> {
    const db = await initDB();
    const result = await db.execute(
      'INSERT INTO categories (name, color) VALUES ($1, $2)',
      [name, color]
    );
    
    return {
      id: result.lastInsertId as number,
      name,
      color
    };
  }

  static async deleteCategory(id: number): Promise<void> {
    const db = await initDB();
    // 1. Update tasks to set category_id to NULL
    await db.execute('UPDATE tasks SET category_id = NULL WHERE category_id = $1', [id]);
    // 2. Delete the category
    await db.execute('DELETE FROM categories WHERE id = $1', [id]);
  }
}
