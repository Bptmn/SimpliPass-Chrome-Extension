const pageState = {};
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const activeContentScriptTabs = /* @__PURE__ */ new Set();
function forwardLogToContentScripts(level, message) {
  activeContentScriptTabs.forEach((tabId) => {
    chrome.tabs.sendMessage(tabId, {
      type: "BACKGROUND_LOG",
      level,
      message
    }).catch(() => {
      activeContentScriptTabs.delete(tabId);
    });
  });
}
console.log = (...args) => {
  originalConsoleLog(...args);
  forwardLogToContentScripts("log", args.join(" "));
};
console.error = (...args) => {
  originalConsoleError(...args);
  forwardLogToContentScripts("error", args.join(" "));
};
console.warn = (...args) => {
  originalConsoleWarn(...args);
  forwardLogToContentScripts("warn", args.join(" "));
};
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "CONTENT_SCRIPT_READY" && sender.tab?.id != null) {
    activeContentScriptTabs.add(sender.tab.id);
    console.log("[Background] Content script registered for tab:", sender.tab.id);
  }
  if (msg.type === "PAGE_INFO" && sender.tab?.id != null) {
    pageState[sender.tab.id] = { url: msg.url, domain: msg.domain, hasLoginForm: msg.hasLoginForm };
  }
  if (msg.type === "GET_PAGE_STATE" && msg.tabId != null) {
    console.log("[Background] GET_PAGE_STATE request for tabId:", msg.tabId);
    if (pageState[msg.tabId]) {
      console.log("[Background] Returning cached page state for tabId:", msg.tabId);
      sendResponse(pageState[msg.tabId]);
      return true;
    }
    (async () => {
      try {
        const tab = await chrome.tabs.get(msg.tabId);
        console.log("[Background] Tab info:", { id: tab.id, url: tab.url, status: tab.status });
        if (tab.url && (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://") || tab.url.startsWith("moz-extension://"))) {
          console.log("[Background] Cannot access restricted URL:", tab.url);
          sendResponse({
            url: tab.url || "",
            domain: "restricted",
            hasLoginForm: false,
            error: "Cannot access chrome:// or extension URLs"
          });
          return;
        }
        console.log("[Background] Executing script for tabId:", msg.tabId);
        const results = await chrome.scripting.executeScript({
          target: { tabId: msg.tabId },
          func: () => ({
            url: window.location.href,
            domain: window.location.hostname,
            hasLoginForm: !!document.querySelector('form input[type="password"]')
          })
        });
        if (results && results[0]?.result) {
          const pageInfo = results[0].result;
          console.log("[Background] Page state retrieved:", pageInfo);
          pageState[msg.tabId] = pageInfo;
          sendResponse(pageInfo);
        } else {
          console.log("[Background] No results from script execution");
          sendResponse(null);
        }
      } catch (error) {
        console.error("[Background] Error executing script for page state:", error);
        sendResponse({
          url: "",
          domain: "unknown",
          hasLoginForm: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    })();
    return true;
  }
});
chrome.tabs.onRemoved.addListener((tabId) => {
  delete pageState[tabId];
  activeContentScriptTabs.delete(tabId);
  console.log("[Background] Tab removed, cleaned up state for tab:", tabId);
});
//# sourceMappingURL=background.js.map
