import React, { useState } from 'react';
import { View } from 'react-native';
import { Slider } from '../Slider';

export default {
  title: 'Components/Slider',
  component: Slider,
};

export const AllSliders = () => {
  const [value1, setValue1] = useState(12);

  return (
    <View style={{ gap: 16, width: 400, padding: 24, flexDirection: 'column' }}>
      <Slider
        min={5}
        max={25}
        value={value1}
        onValueChange={setValue1}
        label="Longueur du mot de passe"
      />
    </View>
  );
}; 