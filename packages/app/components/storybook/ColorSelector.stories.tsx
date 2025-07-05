import React, { useState } from 'react';
import { ColorSelector } from '../ColorSelector';

export default {
  title: 'Components/ColorSelector',
  component: ColorSelector,
  argTypes: {
    title: { control: 'text' },
  },
};

export const Default = (args: any) => {
  const [color, setColor] = useState<string | undefined>(undefined);
  return (
      <ColorSelector
        title={args.title || 'Choisissez la couleur de votre note'}
        value={color}
        onChange={setColor}
      />
  );
};

Default.args = {
  title: 'Choisissez la couleur de votre note',
}; 