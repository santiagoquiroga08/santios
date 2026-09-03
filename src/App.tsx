import { useEffect, useState } from 'react';
import { isTauri } from './services/di';
import { TaskApp } from './features/tasks/components/TaskApp';
import { AuthProvider } from './features/auth/context/AuthContext';

function App() {
  const [dbReady, setDbReady] = useState(!isTauri); // If web, DB is ready instantly
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isTauri) return;

    // Solo cargamos la base de datos local si estamos en Tauri
    import('./services/database').then(({ initDB }) => {
      initDB()
        .then(() => setDbReady(true))
        .catch((error) => {
          console.error("Fallo al conectar la base de datos:", error);
          setErrorMsg(String(error));
        });
    });
  }, []);

  useEffect(() => {
    if (!isTauri) return;
    
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        getCurrentWindow().hide().catch(err => console.error("Error hiding window:", err));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (errorMsg) {
    return (
      <div className="app-loading" style={{ flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '22px' }}>❌</span>
        <span style={{ color: '#f87171', fontSize: '13px', maxWidth: '340px', textAlign: 'center' }}>{errorMsg}</span>
      </div>
    );
  }

  if (!dbReady) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <span>Cargando base de datos…</span>
      </div>
    );
  }

  return (
    <AuthProvider>
      <TaskApp />
    </AuthProvider>
  );
}

export default App;