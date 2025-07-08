import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { View, Text, Pressable } from 'react-native';

import { Icon } from './Icon';
import { useThemeMode } from '@app/core/logic/theme';
import { getColors } from '@design/colors';
import { layout, spacing } from '@design/layout';
import { typography } from '@design/typography';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
}

const Navbar: React.FC = () => {
  const { mode } = useThemeMode();
  const themeColors = getColors(mode);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      path: '/home',
      icon: <Icon name="home" size={25} color={themeColors.primary} />,
      label: 'Accueil',
    },
    {
      path: '/generator',
      icon: <Icon name="loop" size={25} color={themeColors.primary} />,
      label: 'Générateur',
    },
    {
      path: '/settings',
      icon: <Icon name="settings" size={25} color={themeColors.primary} />,
      label: 'Paramètres',
    },
  ];

  // Dynamic styles with useMemo
  const styles = React.useMemo(() => ({
    active: {
      // Color will be applied to text elements
    },
    navContent: {
      alignItems: 'center' as const,
      flexDirection: 'column' as const,
      marginBottom: spacing.xxs,
    },
    navItem: {
      alignItems: 'center' as const,
      backgroundColor: 'transparent',
      borderWidth: 0,
      flex: 1,
      flexDirection: 'row' as const,
      height: '100%',
      justifyContent: 'center' as const,
      padding: 0,
    },
    navLabel: {
      color: themeColors.tertiary,
      fontFamily: typography.fontFamily.base,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      marginTop: spacing.xxs,
    },
    navbar: {
      alignItems: 'center' as const,
      backgroundColor: themeColors.primaryBackground,
      borderBottomColor: themeColors.borderColor,
      borderBottomWidth: 1,
      flexDirection: 'row' as const,
      height: layout.navbarHeight,
      justifyContent: 'space-around' as const,
      maxHeight: layout.navbarHeight,
      minHeight: layout.navbarHeight,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      width: '100%',
      zIndex: 1000,
    },
  }), [mode]);

  return (
    <View style={styles.navbar}>
      {navItems.map((item) => (
        <Pressable
          key={item.path}
          style={[
            styles.navItem,
            location.pathname === item.path ? styles.active : null,
          ]}
          onPress={() => navigate(item.path)}
          accessibilityRole="button"
          accessibilityLabel={item.label}
        >
          <View style={styles.navContent}>
            {item.icon}
            <Text style={[
              styles.navLabel,
              location.pathname === item.path ? { color: themeColors.primary } : null,
            ]}>
              {item.label}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

export default Navbar;
