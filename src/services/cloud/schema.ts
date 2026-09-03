import { tursoClient } from './tursoClient';

export async function initCloudSchema() {
  try {
    console.log("Iniciando creación de esquema remoto en Turso...");
    
    // Como estamos en fase de desarrollo y hubo un cambio de esquema (añadimos updated_at a categories),
    // borraremos las tablas remotas y las volveremos a crear para asegurar consistencia.
    await tursoClient.execute(`DROP TABLE IF EXISTS tasks`);
    await tursoClient.execute(`DROP TABLE IF EXISTS categories`);

    await tursoClient.execute(`
      CREATE TABLE categories (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        deleted_at DATETIME DEFAULT NULL,
        UNIQUE(user_id, name)
      )
    `);

    await tursoClient.execute(`
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

    console.log("✅ Esquema remoto en Turso inicializado exitosamente.");
  } catch (error) {
    console.error("❌ Error al inicializar el esquema en Turso:", error);
    throw error;
  }
}
