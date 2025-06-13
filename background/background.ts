// Background script for SimpliPass
chrome.runtime.onInstalled.addListener((): void => {
  console.log('SimpliPass extension installed');
});

// Add your background script logic here 