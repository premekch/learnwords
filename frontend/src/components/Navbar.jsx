import { NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useLanguageStore } from '../store/languageStore';
import { getLanguagePairs } from '../api/languages';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const { data: pairs = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguagePairs,
  });

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

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
        <button
          onClick={handleLogout}
          className="btn btn-ghost btn-sm"
          title={`Odhlásit se (${user?.email})`}
        >
          Odhlásit
        </button>
      </div>
    </nav>
  );
}
