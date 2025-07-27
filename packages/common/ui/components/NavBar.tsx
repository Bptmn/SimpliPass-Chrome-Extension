import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { Icon } from './Icon';
import { useThemeMode } from '@common/ui/design/theme';
import { getColors } from '@ui/design/colors';
import { layout } from '@ui/design/layout';

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
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        navbar: {
          alignItems: 'center',
          backgroundColor: themeColors.primaryBackground,
          borderBottomColor: themeColors.borderColor,
          borderBottomWidth: 1,
          flexDirection: 'row',
          height: layout.navbarHeight,
          justifyContent: 'space-around',
          maxHeight: layout.navbarHeight,
          minHeight: layout.navbarHeight,
          paddingHorizontal: 16,
          paddingVertical: 4,
          width: '100%',
          zIndex: 1000,
        },
        navItem: {
          alignItems: 'center',
          backgroundColor: 'transparent',
          borderWidth: 0,
          flex: 1,
          flexDirection: 'row',
          height: '100%',
          justifyContent: 'center',
          padding: 0,
        },
        active: {},
        navContent: {
          alignItems: 'center',
          flexDirection: 'column',
          marginBottom: 2,
        },
        navLabel: {
          color: themeColors.tertiary,
          fontFamily: 'System',
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
        },
        title: {
          color: themeColors.tertiary,
          fontSize: 18,
          fontWeight: 'bold',
        },
      }),
    [themeColors.primaryBackground, themeColors.borderColor, themeColors.tertiary]
  );

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
