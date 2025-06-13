import React from 'react';
import { useNavigate } from 'react-router-dom';
import './helperBar.css';

export const HelperBar: React.FC = () => {
  const navigate = useNavigate();

  const handleAddCredential = () => {
    // TODO: Implement add credential logic
    console.log('Add credential clicked');
  };

  const handleFAQ = () => {
    // TODO: Implement FAQ navigation
    console.log('FAQ clicked');
  };

  const handleRefresh = () => {
    // TODO: Implement refresh logic
    console.log('Refresh clicked');
    window.location.reload();
  };

  return (
    <div className="helperBar">
      <button onClick={handleAddCredential} title="Add Credential">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add
      </button>
      <button onClick={handleFAQ} title="FAQ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        FAQ
      </button>
      <button onClick={handleRefresh} title="Refresh">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 4v6h-6"></path>
          <path d="M1 20v-6h6"></path>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
        Refresh
      </button>
    </div>
  );
}; 