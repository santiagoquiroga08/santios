import { ITaskRepository, ICategoryRepository } from '../features/tasks/types/repositories';
import { TauriTaskRepository } from '../features/tasks/services/task.repository';
import { TauriCategoryRepository } from '../features/tasks/services/category.repository';
import { CloudTaskRepository } from '../features/tasks/services/cloud.task.repository';
import { CloudCategoryRepository } from '../features/tasks/services/cloud.category.repository';

// Verificamos si estamos corriendo dentro de Tauri
export const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

export const taskRepository: ITaskRepository = isTauri 
  ? new TauriTaskRepository() 
  : new CloudTaskRepository();

export const categoryRepository: ICategoryRepository = isTauri 
  ? new TauriCategoryRepository() 
  : new CloudCategoryRepository();

if (isTauri) {
  console.log("🛠️ Entorno detectado: Escritorio (Tauri) -> Usando Repositorios Locales (SQLite)");
} else {
  console.log("☁️ Entorno detectado: Web/PWA -> Usando Repositorios Cloud (Turso directos)");
}
