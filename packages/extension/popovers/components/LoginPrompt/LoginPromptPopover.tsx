/**
 * Login Prompt Popover Component
 * Displays when user needs to log in to use autofill features
 */

import React from 'react';

interface LoginPromptPopoverProps {
  onLogin: () => void;
  onCancel: () => void;
}

export const LoginPromptPopover: React.FC<LoginPromptPopoverProps> = ({
  onLogin,
  onCancel
}) => {
  return (
    <div className="login-prompt-popover">
      <div className="login-prompt">
        <div className="title">SimpliPass</div>
        <div className="message">You need to log in to use autofill features.</div>
        <div className="buttons">
          <button 
            className="btn btn-cancel" 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="btn btn-login" 
            onClick={onLogin}
          >
            Login
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .login-prompt-popover {
          position: fixed;
          z-index: 10000;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 16px;
          width: 280px;
          text-align: center;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        
        .title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }
        
        .message {
          font-size: 14px;
          color: #666;
          line-height: 1.4;
          margin-bottom: 16px;
        }
        
        .buttons {
          display: flex;
          gap: 8px;
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
        
        .btn-login {
          background-color: #007AFF;
          color: white;
        }
        
        .btn-login:hover {
          background-color: #0056CC;
        }
      `}</style>
    </div>
  );
};
