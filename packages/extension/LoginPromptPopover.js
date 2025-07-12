// LoginPromptPopover.js
// This file handles the login prompt popover functionality

document.addEventListener('DOMContentLoaded', () => {
  const cancelBtn = document.getElementById('cancel-btn');
  const loginBtn = document.getElementById('login-btn');

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      window.parent.postMessage({ type: 'LOGIN_PROMPT_CANCEL' }, '*');
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      window.parent.postMessage({ type: 'LOGIN_PROMPT_LOGIN' }, '*');
    });
  }
}); 