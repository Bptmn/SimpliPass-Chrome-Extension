import React, { useEffect, useRef, useState } from 'react';
import { CachedCredential } from '../../../src/types';
import './inPageCredentialPicker.css';

interface InPageCredentialPickerProps {
  credentials: CachedCredential[];
  onSelect: (credentialId: string) => void;
  anchorRect: DOMRect | null;
  onClose: () => void;
}

export const InPageCredentialPicker: React.FC<InPageCredentialPickerProps> = ({ credentials, onSelect, anchorRect, onClose }) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');

  // Position the picker near the anchor (login form)
  useEffect(() => {
    if (pickerRef.current && anchorRect) {
      const picker = pickerRef.current;
      picker.style.position = 'absolute';
      picker.style.top = `${anchorRect.bottom + window.scrollY + 8}px`;
      picker.style.left = `${anchorRect.left + window.scrollX}px`;
      picker.style.zIndex = '2147483647';
    }
  }, [anchorRect]);

  // Keyboard navigation and focus trap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!anchorRect) return null;

  const filtered = credentials.filter(cred =>
    cred.username?.toLowerCase().includes(search.toLowerCase()) ||
    cred.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      ref={pickerRef}
      className="inpage-credential-picker styled-card"
      role="listbox"
      aria-label="Suggested credentials"
      tabIndex={-1}
    >
      <div className="inpage-header">
        <div className="inpage-header-left">
          <span className="inpage-header-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>
          </span>
          <span className="inpage-header-title">E-mail</span>
        </div>
        <div className="inpage-header-search">
          <input
            type="search"
            className="inpage-search-input"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search credentials"
          />
        </div>
      </div>
      <div className="inpage-list">
        {filtered.length === 0 ? (
          <div className="inpage-empty">No credentials for this site.</div>
        ) : (
          filtered.map((cred, idx) => (
            <button
              key={cred.id}
              className="inpage-credential-item"
              role="option"
              aria-label={`Use credential for ${cred.title} (${cred.username})`}
              tabIndex={0}
              onClick={() => onSelect(cred.id)}
              style={{ width: '100%' }}
            >
              <div className="inpage-cred-row">
                <span className="inpage-cred-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>
                </span>
                <span className="inpage-cred-info">
                  <span className="inpage-cred-email">{cred.username}</span>
                  <span className="inpage-cred-label">{cred.title}</span>
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}; 