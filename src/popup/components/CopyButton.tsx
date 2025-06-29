import React from 'react';
import { Icon } from './Icon';
import '../../styles/common.css';
import '../../styles/tokens.css';

interface CopyButtonProps {
  textToCopy: string;
  ariaLabel?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy, ariaLabel = 'Copier', children, onClick }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      if (onClick) onClick();
      // Optionally, show a feedback (can be improved)
      alert('Copié !');
    } catch (e) {
      alert('Erreur lors de la copie');
    }
  };

  return (
    <button
      className="btn-copy details-copy-btn"
      onClick={handleCopy}
      aria-label={ariaLabel}
      type="button"
    >
      <div className="btn-copy-container">
        <Icon name="copy" size={25} color={'white'} />
        <span>{children || 'copier'}</span>
      </div>
    </button>
  );
};

export default CopyButton; 