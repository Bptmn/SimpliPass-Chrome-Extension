/**
 * Credential Picker Popover Component
 * Displays matching credentials for autofill
 */

import React from 'react';

interface Credential {
  id: string;
  title: string;
  username: string;
  url?: string;
}

interface CredentialPickerPopoverProps {
  credentials: Credential[];
  onSelectCredential: (credential: Credential) => void;
  onCancel: () => void;
}

export const CredentialPickerPopover: React.FC<CredentialPickerPopoverProps> = ({
  credentials,
  onSelectCredential,
  onCancel
}) => {
  return (
    <div className="credential-picker-popover">
      <div className="credential-picker">
        <div className="title">SimpliPass</div>
        <div className="subtitle">Select a credential to autofill:</div>
        
        {credentials.length === 0 ? (
          <div className="no-credentials">
            <div className="message">No matching credentials found</div>
          </div>
        ) : (
          <div className="credentials-list">
            {credentials.map((credential) => (
              <div 
                key={credential.id}
                className="credential-item"
                onClick={() => onSelectCredential(credential)}
              >
                <div className="credential-title">{credential.title}</div>
                <div className="credential-username">{credential.username}</div>
                {credential.url && (
                  <div className="credential-url">{credential.url}</div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="buttons">
          <button 
            className="btn btn-cancel" 
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .credential-picker-popover {
          position: fixed;
          z-index: 10000;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 16px;
          width: 320px;
          max-height: 400px;
          overflow-y: auto;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        .title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }
        
        .subtitle {
          font-size: 14px;
          color: #666;
          margin-bottom: 12px;
        }
        
        .no-credentials {
          text-align: center;
          padding: 20px;
        }
        
        .no-credentials .message {
          color: #666;
          font-size: 14px;
        }
        
        .credentials-list {
          margin-bottom: 16px;
        }
        
        .credential-item {
          padding: 12px;
          border: 1px solid #E5E5EA;
          border-radius: 6px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .credential-item:hover {
          background-color: #F2F2F7;
        }
        
        .credential-title {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }
        
        .credential-username {
          font-size: 13px;
          color: #666;
          margin-bottom: 2px;
        }
        
        .credential-url {
          font-size: 12px;
          color: #999;
        }
        
        .buttons {
          display: flex;
          justify-content: center;
        }
        
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          min-width: 80px;
          transition: background-color 0.2s;
        }
        
        .btn-cancel {
          background-color: #F2F2F7;
          color: #333;
        }
        
        .btn-cancel:hover {
          background-color: #E5E5EA;
        }
      `}</style>
    </div>
  );
};
