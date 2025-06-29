import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/Navbar.module.css';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  {
    path: '/home',
    icon: <span>🏠</span>,
    label: 'Accueil',
  },
  {
    path: '/generator',
    icon: <span>🔄</span>,
    label: 'Générateur',
  },
  {
    path: '/settings',
    icon: <span>⚙️</span>,
    label: 'Paramètres',
  },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="navbar">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <div className="nav-content">
            {item.icon}
            <span>{item.label}</span>
          </div>
        </button>
      ))}
    </nav>
  );
};

export default Navbar;