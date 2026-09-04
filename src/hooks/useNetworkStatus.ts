import { useState, useEffect } from 'react';

/**
 * Hook para monitorear el estado de conectividad a internet en el navegador.
 * Inicializa con navigator.onLine y escucha los eventos nativos 'online' y 'offline'.
 * 
 * @returns boolean isOnline - true si el dispositivo tiene conexión de red, false si está desconectado.
 */
export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
      ? navigator.onLine
      : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export default useNetworkStatus;
