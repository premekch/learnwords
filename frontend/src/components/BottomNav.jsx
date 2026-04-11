import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Přehled', icon: '🏠' },
  { to: '/words',     label: 'Slovíčka', icon: '📚' },
  { to: '/study',     label: 'Učení',    icon: '🎯' },
  { to: '/stats',     label: 'Stats',    icon: '📊' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {links.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
        >
          <span className="icon">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
