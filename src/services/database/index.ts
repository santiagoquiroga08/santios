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
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          color TEXT
        )
      `);

      await db.execute(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          completed BOOLEAN NOT NULL DEFAULT 0,
          priority TEXT NOT NULL,
          due_date TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME,
          category_id INTEGER REFERENCES categories(id)
        )
      `);

      // Migración mínima: añadir la columna updated_at si la tabla ya existía sin ella.
      try {
        await db.execute(`ALTER TABLE tasks ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
      } catch (e) {}

      // Migración mínima: añadir la columna category_id
      try {
        await db.execute(`ALTER TABLE tasks ADD COLUMN category_id INTEGER REFERENCES categories(id)`);
      } catch (e) {}

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