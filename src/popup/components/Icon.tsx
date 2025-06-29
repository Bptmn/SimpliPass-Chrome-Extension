// src/components/Icon.tsx
import React from 'react';

import { IconsMap, IconKey } from 'utils/icon';
import '../../styles/common.css';
import '../../styles/tokens.css';

interface Props {
  name: IconKey;
  size?: number;
  color?: string;
}

export const Icon: React.FC<Props> = ({ name, size = 24, color }) => {
  const Comp = IconsMap[name];
  return <Comp size={size} color={color} />;
};
