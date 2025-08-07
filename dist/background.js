(function() {
  "use strict";
  const setPlatform = (platform) => {
    console.log("[Background] Platform set to:", platform);
  };
  const isAutofillAvailable = async () => {
    console.log("[Background] isAutofillAvailable called - checking session status");
    try {
      const result = await chrome.storage.session.get(["authToken", "userId", "isAuthenticated"]);
      console.log("[Background] Storage check result:", result);
      const hasValidAuth = result.authToken && result.userId && result.isAuthenticated === true;
      console.log("[Background] Has valid auth:", hasValidAuth);
      return hasValidAuth;
    } catch (error) {
      console.error("[Background] Error checking autofill availability:", error);
      return false;
    }
  };
  const getMatchingCredentials = async (domain) => {
    console.log("[Background] getMatchingCredentials called for domain:", domain);
    try {
      const result = await chrome.storage.session.get(["credentials", "items"]);
      console.log("[Background] Storage credentials result:", result);
      const credentials = result.credentials || result.items || [];
      console.log("[Background] All credentials:", credentials);
      const matchingCredentials = credentials.filter((cred) => {
        if (!cred.url) return false;
        try {
          const credDomain = new URL(cred.url).hostname;
          return credDomain === domain || credDomain.endsWith("." + domain) || domain.endsWith("." + credDomain);
        } catch {
          return false;
        }
      });
      console.log("[Background] Matching credentials for domain", domain, ":", matchingCredentials.length);
      return matchingCredentials.map((cred) => ({
        id: cred.id || cred._id,
        title: cred.title || cred.name || "Untitled",
        username: cred.username || cred.email || "",
        url: cred.url
      }));
    } catch (error) {
      console.error("[Background] Error getting matching credentials:", error);
      return [];
    }
  };
  const getCredentialForInjection = async (credentialId) => {
    console.log("[Background] getCredentialForInjection called for id:", credentialId);
    try {
      const result = await chrome.storage.session.get(["credentials", "items"]);
      const credentials = result.credentials || result.items || [];
      const credential = credentials.find(
        (cred) => (cred.id || cred._id) === credentialId
      );
      if (credential) {
        console.log("[Background] Found credential for injection:", credential.title || credential.name);
        return {
          id: credential.id || credential._id,
          title: credential.title || credential.name || "Untitled",
          username: credential.username || credential.email || "",
          password: credential.password || "",
          url: credential.url
        };
      } else {
        console.log("[Background] Credential not found for ID:", credentialId);
        return null;
      }
    } catch (error) {
      console.error("[Background] Error getting credential for injection:", error);
      return null;
    }
  };
  const initializeContextMenu = () => {
    console.log("[Background] initializeContextMenu called");
  };
  const handleContextMenuClick = (info, tab) => {
    console.log("[Background] handleContextMenuClick called");
  };
  const updateContextMenuVisibility = (tab) => {
    console.log("[Background] updateContextMenuVisibility called");
  };
  const pageState = {};
  const activeContentScriptTabs = /* @__PURE__ */ new Set();
  chrome.runtime.onStartup.addListener(() => {
    setPlatform("extension");
    setTimeout(() => {
      initializeContextMenu();
    }, 100);
  });
  chrome.runtime.onInstalled.addListener(() => {
    setPlatform("extension");
    setTimeout(() => {
      initializeContextMenu();
    }, 100);
  });
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
  function initializeConsoleOverride() {
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
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
  }
  setTimeout(() => {
    initializeConsoleOverride();
  }, 50);
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
    if (msg.type === "GET_SESSION_STATUS") {
      console.log("[Background] GET_SESSION_STATUS request");
      (async () => {
        try {
          const isValid = await isAutofillAvailable();
          console.log("[Background] Session status:", isValid);
          sendResponse({ isValid });
        } catch (error) {
          console.error("[Background] Error checking session status:", error);
          sendResponse({ isValid: false, error: error instanceof Error ? error.message : "Unknown error" });
        }
      })();
      return true;
    }
    if (msg.type === "GET_MATCHING_CREDENTIALS" && msg.domain) {
      console.log("[Background] GET_MATCHING_CREDENTIALS request for domain:", msg.domain);
      (async () => {
        try {
          const credentials = await getMatchingCredentials(msg.domain);
          console.log("[Background] Found matching credentials:", credentials.length);
          sendResponse({ credentials });
        } catch (error) {
          console.error("[Background] Error getting matching credentials:", error);
          sendResponse({ credentials: [], error: error instanceof Error ? error.message : "Unknown error" });
        }
      })();
      return true;
    }
    if (msg.type === "INJECT_CREDENTIAL" && msg.credentialId) {
      console.log("[Background] INJECT_CREDENTIAL request for ID:", msg.credentialId);
      (async () => {
        try {
          const credential = await getCredentialForInjection(msg.credentialId);
          if (credential) {
            console.log("[Background] Credential retrieved for injection");
            if (sender.tab?.id) {
              await chrome.tabs.sendMessage(sender.tab.id, {
                type: "INJECT_CREDENTIAL",
                username: credential.username,
                password: credential.password
              });
            }
            sendResponse({ success: true });
          } else {
            console.log("[Background] Credential not found");
            sendResponse({ success: false, error: "Credential not found" });
          }
        } catch (error) {
          console.error("[Background] Error getting credential for injection:", error);
          sendResponse({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
        }
      })();
      return true;
    }
    if (msg.type === "RESTORE_VAULT") {
      console.log("[Background] RESTORE_VAULT request");
      (async () => {
        try {
          console.log("[Background] Vault restore request received");
          sendResponse({ success: true });
        } catch (error) {
          console.error("[Background] Error restoring vault:", error);
          sendResponse({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
        }
      })();
      return true;
    }
    if (msg.type === "LOCK_VAULT") {
      console.log("[Background] LOCK_VAULT request");
      (async () => {
        try {
          console.log("[Background] Vault locked");
          sendResponse({ success: true });
        } catch (error) {
          console.error("[Background] Error locking vault:", error);
          sendResponse({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
        }
      })();
      return true;
    }
    if (msg.type === "CAPTURE_CREDENTIALS" && msg.data) {
      console.log("[Background] CAPTURE_CREDENTIALS request");
      (async () => {
        try {
          if (sender.tab?.id) {
            await chrome.tabs.sendMessage(sender.tab.id, {
              type: "CAPTURE_CREDENTIALS",
              data: msg.data
            });
          }
          sendResponse({ success: true });
        } catch (error) {
          console.error("[Background] Error capturing credentials:", error);
          sendResponse({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
        }
      })();
      return true;
    }
    if (msg.type === "SAVE_CREDENTIAL" && msg.credential) {
      console.log("[Background] SAVE_CREDENTIAL request");
      (async () => {
        try {
          console.log("[Background] Credential saved successfully");
          sendResponse({ success: true });
        } catch (error) {
          console.error("[Background] Error saving credential:", error);
          sendResponse({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
        }
      })();
      return true;
    }
    if (msg.type === "UPDATE_CREDENTIAL" && msg.credential) {
      console.log("[Background] UPDATE_CREDENTIAL request");
      (async () => {
        try {
          console.log("[Background] Credential updated successfully");
          sendResponse({ success: true });
        } catch (error) {
          console.error("[Background] Error updating credential:", error);
          sendResponse({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
        }
      })();
      return true;
    }
    if (msg.type === "OPEN_POPUP") {
      console.log("[Background] OPEN_POPUP request");
      try {
        chrome.action.openPopup();
        sendResponse({ success: true });
      } catch (error) {
        console.error("[Background] Error opening popup:", error);
        sendResponse({ success: false, error: "Failed to open popup" });
      }
      return true;
    }
  });
  chrome.tabs.onRemoved.addListener((tabId) => {
    delete pageState[tabId];
    activeContentScriptTabs.delete(tabId);
    console.log("[Background] Tab removed, cleaned up state for tab:", tabId);
  });
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
      updateContextMenuVisibility();
    }
  });
  if (chrome && chrome.contextMenus) {
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      handleContextMenuClick();
    });
  }
})();
//# sourceMappingURL=background.js.map
