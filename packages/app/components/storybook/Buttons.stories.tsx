import React from 'react';
import { View } from 'react-native';
import { Button, ButtonOutline } from '../Buttons';
import { colors } from '@design/colors';

export default {
  title: 'Components/Buttons',
  component: Button,
};

export const AllButtons = () => (
  <View style={{ gap: 16, width: 400, padding: 24, flexDirection: 'column' }}>
    <Button text="Générer un mot de passe" color={colors.secondary} size="medium" onPress={() => {}} />
    <Button text="Petit bouton" color={colors.primary} size="small" onPress={() => {}} />
    <ButtonOutline text="Générer un mot de passe" color={colors.secondary} size="medium" onPress={() => {}} />
    <ButtonOutline text="Petit bouton" color={colors.primary} size="small" onPress={() => {}} />
    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', width: '100%' }}>
      <Button text="Générer un mot de passe" color={colors.secondary} size="medium" onPress={() => {}} />
      <Button text="Petit bouton" color={colors.primary} size="medium" onPress={() => {}} />
    </View>
  </View>
);