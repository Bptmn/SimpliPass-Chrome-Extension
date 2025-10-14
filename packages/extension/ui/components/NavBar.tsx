/**
 * NavBar.tsx (Extension / DOM)
 *
 * Purpose: Bottom navigation bar with main app sections
 */

import React from 'react';
import { Icon } from './Icon';
import { useAppRouterContext } from '../router/AppRouterProvider';
import { ROUTES } from '../router/ROUTES';
import { colors, spacing, radius, typography, textStyles } from '../design';
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
    borderBottom: `1px solid ${colors.borderColor}`,
    height: 50,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 4,
    paddingBottom: 4,
    width: '100%',
    zIndex: 1000,
    position: 'sticky' as const,
    top: 0,
    boxSizing: 'border-box',
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
    ...textStyles.descriptionSmall,
    fontSize: typography.fontSize.xxs,
    marginTop: 2,
  },
};

export default NavBar;
