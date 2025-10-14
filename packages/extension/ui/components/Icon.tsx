/**
 * Icon.tsx (Extension / DOM)
 *
 * Purpose: Icon component using react-icons for consistent iconography
 */

import React from 'react';
import { IconsMap, IconKey } from '@common/utils/icon';

interface Props {
  name: IconKey;
  size?: number;
  color?: string;
}

export const Icon: React.FC<Props> = ({ name, size = 24, color }) => {
  const Comp = IconsMap[name];
  if (!Comp) {
    console.error(`Icon "${name}" not found in IconsMap`);
    return null;
  }
  return <Comp size={size} color={color} />;
};

export default Icon;
