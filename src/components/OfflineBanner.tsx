import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface OfflineBannerProps {
  isOnline?: boolean;
}

/**
 * Componente visual de notificación de desconexión no intrusivo.
 * Se renderiza únicamente si el dispositivo está sin conexión a internet (isOnline === false).
 */
export function OfflineBanner({ isOnline: propIsOnline }: OfflineBannerProps) {
  const hookIsOnline = useNetworkStatus();
  const isOnline = propIsOnline !== undefined ? propIsOnline : hookIsOnline;

  if (isOnline) {
    return null;
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className="offline-banner"
      style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'var(--error-color, var(--danger, #ef4444))',
        color: '#ffffff',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: 500,
        padding: '6px 12px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      <span>Sin conexión a internet</span>
    </aside>
  );
}

export default OfflineBanner;
