import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { Icon } from './Icon';
import { colors } from '@design/colors';
import { layout, spacing } from '@design/layout';
import { typography } from '@design/typography';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  {
    path: '/home',
    icon: <Icon name="home" size={25} color={colors.primary} />,
    label: 'Accueil',
  },
  {
    path: '/generator',
    icon: <Icon name="loop" size={25} color={colors.primary} />,
    label: 'Générateur',
  },
  {
    path: '/settings',
    icon: <Icon name="settings" size={25} color={colors.primary} />,
    label: 'Paramètres',
  },
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
              location.pathname === item.path ? { color: colors.primary } : null,
            ]}>
              {item.label}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  active: {
    // Color will be applied to text elements
  },
  navContent: {
    alignItems: 'center',
    flexDirection: 'column',
    marginBottom: spacing.xxs,
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
  navLabel: {
    color: colors.tertiary,
    fontFamily: typography.fontFamily.base,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.xxs,
  },
  navbar: {
    alignItems: 'center',
    backgroundColor: layout.primaryBackground,
    borderBottomColor: colors.borderColor,
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: layout.navbarHeight,
    justifyContent: 'space-around',
    maxHeight: layout.navbarHeight,
    minHeight: layout.navbarHeight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    width: '100%',
    zIndex: 1000,
  },
});

export default Navbar;
