import { createClient } from '@libsql/client/web';

const url = import.meta.env.VITE_TURSO_URL || import.meta.env.VITE_TURSO_DATABASE_URL;
const authToken = import.meta.env.VITE_TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error("Falta la configuración de Turso. Revisa las variables VITE_TURSO_URL (o VITE_TURSO_DATABASE_URL) y VITE_TURSO_AUTH_TOKEN en tus variables de entorno.");
}

export const tursoClient = createClient({
  url,
  authToken,
});
