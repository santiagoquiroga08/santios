import { useEffect, useState } from 'react';
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

  if (errorMsg) {
    return <div style={{ padding: '20px', color: 'red' }}>❌ Error: {errorMsg}</div>;
  }

  if (!dbReady) {
    return <div style={{ padding: '20px', color: 'orange' }}>⏳ Cargando base de datos...</div>;
  }

  return <TaskApp />;
}

export default App;