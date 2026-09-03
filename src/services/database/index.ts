import Database from '@tauri-apps/plugin-sql';

// Guardamos la promesa en curso, no solo la instancia final
let dbPromise: Promise<Database> | null = null;

export const initDB = (): Promise<Database> => {
  // Si ya hay una promesa de conexión en curso, devolvemos la misma
  // Esto evita que React StrictMode llame a Tauri dos veces al mismo tiempo
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    try {
      console.log('⏳ Intentando conectar a la base de datos...');
      
      const db = await Database.load('sqlite:tasks.db');
      await db.execute(`
        CREATE TABLE IF NOT EXISTS categories (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          color TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME DEFAULT NULL,
          UNIQUE(user_id, name)
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          completed BOOLEAN NOT NULL DEFAULT 0,
          priority TEXT NOT NULL,
          due_date TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME,
          deleted_at DATETIME DEFAULT NULL,
          category_id TEXT REFERENCES categories(id)
        )
      `);

      // Parche automático para arreglar el formato de los Timestamps nativos de SQLite
      // y convertirlos al formato ISO 8601 (con T y Z) para que la comparación de strings en el Sync funcione.
      await db.execute(`UPDATE categories SET updated_at = replace(updated_at, ' ', 'T') || 'Z' WHERE updated_at NOT LIKE '%T%' AND updated_at IS NOT NULL;`);
      await db.execute(`UPDATE tasks SET updated_at = replace(updated_at, ' ', 'T') || 'Z' WHERE updated_at NOT LIKE '%T%' AND updated_at IS NOT NULL;`);

      console.log('✅ Base de datos conectada y tablas verificadas/creadas con éxito.');
      return db;
    } catch (error) {
      dbPromise = null; // Si falla, reseteamos para poder reintentar
      console.error('❌ Error al inicializar la base de datos:', error);
      throw error;
    }
  })();

  return dbPromise;
};