import { useEffect, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { initDB } from './services/database';
import { TaskApp } from './features/tasks/components/TaskApp';

function App() {
  const [dbReady, setDbReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    initDB()
      .then(() => {
        setDbReady(true);
      })
      .catch((error) => {
        console.error("Fallo al conectar la base de datos:", error);
        setErrorMsg(String(error));
      });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        getCurrentWindow().hide().catch(err => console.error("Error hiding window:", err));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (errorMsg) {
    return <div style={{ padding: '20px', color: 'red' }}>❌ Error: {errorMsg}</div>;
  }

  if (!dbReady) {
    return <div style={{ padding: '20px', color: 'orange' }}>⏳ Cargando base de datos...</div>;
  }

  return <TaskApp />;
}

export default App;