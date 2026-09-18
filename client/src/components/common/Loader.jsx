export default function Loader({ message = 'Cargando...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      gap: '16px'
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        border: '3px solid rgba(255, 255, 255, 0.1)',
        borderTopColor: 'var(--accent-blue)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>
        {message}
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
