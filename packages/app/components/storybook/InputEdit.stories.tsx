import React, { useState } from 'react';
import { InputEdit } from '../InputEdit';

export default {
  title: 'Components/InputEdit',
  component: InputEdit,
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    value: { control: 'text' },
  },
};

export const Default = (args: any) => {
  const [value, setValue] = useState(args.value || '');
  return (
      <InputEdit
        label={args.label || 'InputTitle'}
        placeholder={args.placeholder || '[inputInitialValue]'}
        value={value}
        onChange={setValue}
        onClear={() => setValue('')}
      />
  );
};

Default.args = {
  label: 'InputTitle',
  placeholder: '[inputInitialValue]',
  value: '[inputInitialValue]',
}; 