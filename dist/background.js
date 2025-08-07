(function() {
  "use strict";
  const setPlatform = (platform) => {
    console.log("[Background] Platform set to:", platform);
  };
  const checkPageCapabilities = async () => {
    console.log("[Background] Checking page capabilities");
    try {
      const sessionData = await chrome.storage.session.get([
        "userSecretKey",
        "user",
        "encryptedVault"
      ]);
      const allKeys = await chrome.storage.session.get(null);
      const allLocalKeys = await chrome.storage.local.get(null);
      console.log("[Background] All session storage keys:", JSON.stringify(allKeys, null, 2));
      console.log("[Background] All local storage keys:", JSON.stringify(allLocalKeys, null, 2));
      console.log("[Background] Requested session data:", JSON.stringify(sessionData, null, 2));
      const isAuthenticated = !!(sessionData.user && sessionData.user.id);
      const hasUserSecretKey = !!sessionData.userSecretKey;
      let hasCredentials = false;
      if (sessionData.encryptedVault) {
        try {
          const vaultData = JSON.parse(sessionData.encryptedVault);
          const vaultItems = vaultData.items;
          hasCredentials = Array.isArray(vaultItems) && vaultItems.length > 0;
          console.log("[Background] Vault parsing:", {
            vaultDataKeys: Object.keys(vaultData),
            itemsArrayExists: !!vaultData.items,
            itemsArrayLength: vaultData.items ? vaultData.items.length : 0,
            hasCredentials
          });
        } catch (error) {
          console.error("[Background] Error parsing vault:", error);
          hasCredentials = false;
        }
      }
      const sessionCheck = {
        isAuthenticated,
        hasUserSecretKey,
        hasCredentials: hasCredentials ? "yes" : "no",
        userData: sessionData.user,
        userSecretKeyExists: !!sessionData.userSecretKey,
        encryptedVaultExists: !!sessionData.encryptedVault,
        encryptedVaultLength: sessionData.encryptedVault ? sessionData.encryptedVault.length : 0
      };
      console.log("[Background] Session data check:", JSON.stringify(sessionCheck, null, 2));
      const capabilities = {
        canAutofill: isAuthenticated && hasCredentials,
        // ✅ Auth + credentials in RAM
        canSaveCredential: isAuthenticated && hasUserSecretKey,
        // ✅ Auth + user secret key
        canGeneratePassword: true,
        // ✅ Always available
        hasCredentials,
        isAuthenticated
      };
      console.log("[Background] Page capabilities:", capabilities);
      return capabilities;
    } catch (error) {
      console.error("[Background] Error checking page capabilities:", error);
      return {
        canAutofill: false,
        canSaveCredential: false,
        canGeneratePassword: true,
        hasCredentials: false,
        isAuthenticated: false
      };
    }
  };
  const isAutofillAvailable = async () => {
    console.log("[Background] isAutofillAvailable called");
    const capabilities = await checkPageCapabilities();
    console.log("[Background] isAutofillAvailable result:", capabilities.canAutofill);
    console.log("[Background] isAutofillAvailable details:", JSON.stringify(capabilities, null, 2));
    return capabilities.canAutofill;
  };
  const isSaveCredentialAvailable = async () => {
    const capabilities = await checkPageCapabilities();
    return capabilities.canSaveCredential;
  };
  const isPasswordGeneratorAvailable = async () => {
    const capabilities = await checkPageCapabilities();
    return capabilities.canGeneratePassword;
  };
  const getMatchingCredentials = async (domain) => {
    console.log("[Background] getMatchingCredentials called for domain:", domain);
    try {
      const vaultData = await chrome.storage.session.get("encryptedVault");
      const vaultString = vaultData.encryptedVault;
      if (!vaultString) {
        console.log("[Background] No vault data found");
        return [];
      }
      const parsedVaultData = JSON.parse(vaultString);
      console.log("[Background] Vault data type:", typeof parsedVaultData);
      console.log("[Background] Vault data keys:", Object.keys(parsedVaultData));
      const allItems = parsedVaultData.items;
      console.log("[Background] Items array type:", typeof allItems);
      console.log("[Background] Items array:", allItems);
      if (!Array.isArray(allItems)) {
        console.log("[Background] Items array is not an array, converting to empty array");
        return [];
      }
      console.log("[Background] All vault items:", allItems.length);
      const matchingCredentials = allItems.filter((item) => item.itemType === "credential").filter((cred) => {
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
        id: cred.id,
        title: cred.title || "Untitled",
        username: cred.username || "",
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
      const vaultData = await chrome.storage.session.get("encryptedVault");
      const vaultString = vaultData.encryptedVault;
      if (!vaultString) {
        console.log("[Background] No vault data found");
        return null;
      }
      const vaultDataForInjection = JSON.parse(vaultString);
      console.log("[Background] Vault data type for injection:", typeof vaultDataForInjection);
      console.log("[Background] Vault data keys for injection:", Object.keys(vaultDataForInjection));
      const allItems = vaultDataForInjection.items;
      console.log("[Background] Items array type for injection:", typeof allItems);
      console.log("[Background] Items array for injection:", allItems);
      if (!Array.isArray(allItems)) {
        console.log("[Background] Items array is not an array for injection");
        return null;
      }
      const credential = allItems.filter((item) => item.itemType === "credential").find((cred) => cred.id === credentialId);
      if (credential) {
        console.log("[Background] Found credential for injection:", credential.title);
        return {
          id: credential.id,
          title: credential.title || "Untitled",
          username: credential.username || "",
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
  const handleContextMenuClick = (_info, _tab) => {
    console.log("[Background] handleContextMenuClick called");
  };
  const updateContextMenuVisibility = (_tab) => {
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
    if (msg.type === "GET_PAGE_CAPABILITIES") {
      console.log("[Background] GET_PAGE_CAPABILITIES request");
      (async () => {
        try {
          const capabilities = await checkPageCapabilities();
          console.log("[Background] Page capabilities:", capabilities);
          sendResponse({ capabilities });
        } catch (error) {
          console.error("[Background] Error checking page capabilities:", error);
          sendResponse({
            capabilities: {
              canAutofill: false,
              canSaveCredential: false,
              canGeneratePassword: true,
              hasCredentials: false,
              isAuthenticated: false
            },
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      })();
      return true;
    }
    if (msg.type === "GET_SAVE_CREDENTIAL_STATUS") {
      console.log("[Background] GET_SAVE_CREDENTIAL_STATUS request");
      (async () => {
        try {
          const isAvailable = await isSaveCredentialAvailable();
          console.log("[Background] Save credential status:", isAvailable);
          sendResponse({ isAvailable });
        } catch (error) {
          console.error("[Background] Error checking save credential status:", error);
          sendResponse({ isAvailable: false, error: error instanceof Error ? error.message : "Unknown error" });
        }
      })();
      return true;
    }
    if (msg.type === "GET_PASSWORD_GENERATOR_STATUS") {
      console.log("[Background] GET_PASSWORD_GENERATOR_STATUS request");
      (async () => {
        try {
          const isAvailable = await isPasswordGeneratorAvailable();
          console.log("[Background] Password generator status:", isAvailable);
          sendResponse({ isAvailable });
        } catch (error) {
          console.error("[Background] Error checking password generator status:", error);
          sendResponse({ isAvailable: false, error: error instanceof Error ? error.message : "Unknown error" });
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
