import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { Icon } from '../ui/Icon';
import styles from 'shared/styles/Navbar.module.css';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  {
    path: '/home',
    icon: <Icon name="home" size={25} color={'var(--color-primary)'} />,
    label: 'Accueil',
  },
  {
    path: '/generator',
    icon: <Icon name="loop" size={25} color={'var(--color-primary)'} />,
    label: 'Générateur',
  },
  {
    path: '/settings',
    icon: <Icon name="settings" size={25} color={'var(--color-primary)'} />,
    label: 'Paramètres',
  },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className={styles.navbar}>
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
          onClick={() => navigate(item.path)}
        >
          <div className={styles.navContent}>
            {item.icon}
            <span>{item.label}</span>
          </div>
        </button>
      ))}
    </nav>
  );
};

export default Navbar;
