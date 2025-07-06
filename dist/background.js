import { p as getUserSecretKey } from "./assets/user-Bmip-JXz.js";
import "./assets/index-CxEHSNH9.js";
const pageState = {};
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "PAGE_INFO" && sender.tab?.id != null) {
    pageState[sender.tab.id] = { url: msg.url, domain: msg.domain, hasLoginForm: msg.hasLoginForm };
  }
  if (msg.type === "GET_PAGE_STATE" && msg.tabId != null) {
    sendResponse(pageState[msg.tabId] || null);
    return true;
  }
  if (msg.type === "INJECT_CREDENTIAL" && msg.credentialId && sender.tab && typeof sender.tab.id === "number") {
    (async () => {
      try {
        const userSecretKey = await getUserSecretKey();
        if (!userSecretKey) {
          sendResponse({ success: false, error: "User secret key not found" });
          return;
        }
        sendResponse({ success: false, error: "User not authenticated (currentUser unavailable)" });
        return;
      } catch (error) {
        sendResponse({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    })();
    return true;
  }
  if (msg.type === "GET_CACHED_CREDENTIALS" && msg.domain) {
    (async () => {
      try {
        const userSecretKey = await getUserSecretKey();
        if (!userSecretKey) {
          sendResponse([]);
          return;
        }
        sendResponse({ success: false, error: "User not authenticated (currentUser unavailable)" });
        return;
      } catch (error) {
        console.error("Error getting cached credentials:", error);
        sendResponse([]);
      }
    })();
    return true;
  }
  if (msg.type === "GET_USER_SECRET_KEY") {
    getUserSecretKey().then((key) => {
      sendResponse({ key });
    }).catch(() => {
      sendResponse({ key: null });
    });
    return true;
  }
});
chrome.tabs.onActivated.addListener((activeInfo) => {
  const tabId = activeInfo.tabId;
  if (!pageState[tabId]) {
    chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const domain = window.location.hostname;
        const hasLogin = !!document.querySelector('form input[type="password"]');
        chrome.runtime.sendMessage({ type: "PAGE_INFO", domain, hasLogin });
      }
    });
  }
});
//# sourceMappingURL=background.js.map
