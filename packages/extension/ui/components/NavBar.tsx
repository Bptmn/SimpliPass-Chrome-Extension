/**
 * NavBar.tsx (Extension / DOM)
 *
 * Purpose: Bottom navigation bar with main app sections
 */

import React from 'react';
import { Icon } from './Icon';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { colors, spacing, radius, typography } from '../design/tokens';
import type { AppRoute } from '../router/ROUTES';

interface NavItem {
  route: AppRoute;
  icon: string;
  label: string;
}

export const NavBar: React.FC = () => {
  const router = useAppRouterContext();
  const currentRoute = router.currentRoute;

  const navItems: NavItem[] = [
    {
      route: ROUTES.HOME,
      icon: 'home',
      label: 'Accueil',
    },
    {
      route: ROUTES.GENERATOR,
      icon: 'loop',
      label: 'Générateur',
    },
    {
      route: ROUTES.SETTINGS,
      icon: 'settings',
      label: 'Paramètres',
    },
  ];

  const handleNavItemPress = (route: AppRoute) => {
    router.navigateTo(route);
  };

  return (
    <div style={styles.navbar} data-testid="nav-bar">
      {navItems.map((item) => {
        const isActive = currentRoute === item.route;
        return (
          <button
            key={item.route}
            style={{
              ...styles.navItem,
              ...(isActive ? styles.active : {}),
            }}
            onClick={() => handleNavItemPress(item.route)}
            data-testid={`nav-${item.route.toLowerCase()}`}
            aria-label={item.label}
          >
            <div style={styles.navContent}>
              <Icon 
                name={item.icon} 
                size={25} 
                color={isActive ? colors.primary : colors.tertiary} 
              />
              <span style={{
                ...styles.navLabel,
                color: isActive ? colors.primary : colors.tertiary,
              }}>
                {item.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  navbar: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.primaryBackground,
    borderTop: `1px solid ${colors.borderColor}`,
    height: 60,
    paddingHorizontal: 16,
    paddingVertical: 4,
    width: '100%',
    zIndex: 1000,
    position: 'sticky',
    bottom: 0,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    flex: 1,
    height: '100%',
    padding: 0,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.2s',
  },
  active: {
    backgroundColor: colors.secondaryBackground,
    borderRadius: radius.sm,
  },
  navContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: typography.fontWeight.medium,
    fontFamily: typography.fontFamily.base,
    marginTop: 2,
  },
};

export default NavBar;
