/**
 * GeneratorPage (Extension / DOM)
 */

import React from 'react';
import { PasswordGeneratorPopover } from '@extension/popovers/components/PasswordGenerator/PasswordGeneratorPopover';

export const GeneratorPage: React.FC = () => {
  return (
    <div style={{ padding: 12 }}>
      <PasswordGeneratorPopover onAccept={() => {}} onRegenerate={() => {}} onCancel={() => {}} />
    </div>
  );
};

export default GeneratorPage;


