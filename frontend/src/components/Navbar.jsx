import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getLanguagePairs } from '../api/languages';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const { data: pairs = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguagePairs,
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const displayName = user?.name || user?.email?.split('@')[0];

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-logo">
        <span className="navbar-logo-icon">LW</span>
        <span>LearnWords</span>
      </NavLink>

      <div className="navbar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Přehled
        </NavLink>
        <NavLink to="/words" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Slovíčka
        </NavLink>
        <NavLink to="/study" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Učení
        </NavLink>
        <NavLink to="/stats" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          Statistiky
        </NavLink>
      </div>

      <div className="navbar-right">
        {pairs.length > 0 && <LanguageSelector pairs={pairs} />}

        {/* User menu */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setMenuOpen((o) => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <span style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--color-primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
            }}>
              {displayName?.[0]?.toUpperCase()}
            </span>
            <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </span>
            <span style={{ fontSize: '0.625rem' }}>▾</span>
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              background: '#fff', border: '1px solid var(--gray-200)',
              borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
              minWidth: 160, zIndex: 200, overflow: 'hidden',
            }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Přihlášen jako</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--gray-800)', wordBreak: 'break-all' }}>
                  {user?.email}
                </div>
              </div>
              <button
                style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem', color: 'var(--gray-700)' }}
                onClick={() => { navigate('/profile'); setMenuOpen(false); }}
              >
                👤 Profil
              </button>
              <button
                style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem', color: 'var(--color-error)' }}
                onClick={handleLogout}
              >
                🚪 Odhlásit se
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
