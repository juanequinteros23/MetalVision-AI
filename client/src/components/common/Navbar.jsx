import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'var(--accent-gradient)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#fff',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'
          }}>
            ⚡
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.02em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              MetalVision AI
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '-3px' }}>
              Deep Learning Surface Inspection
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/" style={{
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: isActive('/') ? '#fff' : 'var(--text-secondary)',
            background: isActive('/') ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
          }}>
            Inicio
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/predict" style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive('/predict') ? '#fff' : 'var(--text-secondary)',
                background: isActive('/predict') ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
              }}>
                🔍 Diagnóstico
              </Link>
              <Link to="/history" style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive('/history') ? '#fff' : 'var(--text-secondary)',
                background: isActive('/history') ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
              }}>
                📋 Historial
              </Link>
              <Link to="/dashboard" style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: isActive('/dashboard') ? '#fff' : 'var(--text-secondary)',
                background: isActive('/dashboard') ? 'rgba(255, 255, 255, 0.08)' : 'transparent'
              }}>
                📊 Métricas
              </Link>

              {/* User badge and logout */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '12px', paddingLeft: '12px', borderLeft: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  👤 <strong>{user?.username}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  Salir
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '10px', marginLeft: '10px' }}>
              <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Ingresar
              </Link>
              <Link to="/register" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Registrarse
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
