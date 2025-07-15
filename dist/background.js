import { j as useCredentialsStore, k as useBankCardsStore, l as useSecureNotesStore, q as getUserSecretKey, _ as __vitePreload } from "./assets/secret-CxEe3Mh2.js";
import "./assets/index-CxEHSNH9.js";
async function loadVaultIfNeeded() {
  const credentialsStore = useCredentialsStore.getState();
  const bankCardsStore = useBankCardsStore.getState();
  const secureNotesStore = useSecureNotesStore.getState();
  if (credentialsStore.credentials.length > 0 || bankCardsStore.bankCards.length > 0 || secureNotesStore.secureNotes.length > 0) {
    return;
  }
  try {
    const userSecretKey = await getUserSecretKey();
    if (!userSecretKey) {
      console.log("[VaultLoader] No persistent userSecretKey found (expected for new or logged-out users)");
      return;
    }
    console.log("[VaultLoader] userSecretKey restored to state");
  } catch (e) {
    console.error("[VaultLoader] Error loading vault:", e);
  }
}
function getRootDomain(hostname) {
  const parts = hostname.split(".").filter(Boolean);
  if (parts.length <= 2) return hostname.replace(/^www\./, "");
  return parts.slice(-2).join(".");
}
function isAutofillAvailable() {
  const credentialsStore = useCredentialsStore.getState();
  return credentialsStore.credentials.length > 0;
}
function getMatchingCredentials(domain) {
  try {
    if (!isAutofillAvailable()) {
      console.log("[AutofillBridge] No valid session for autofill");
      return [];
    }
    const credentialsStore = useCredentialsStore.getState();
    const credentials = credentialsStore.credentials;
    const pageRootDomain = getRootDomain(domain);
    return credentials.filter((credential) => {
      if (!credential.url) return false;
      const credRootDomain = getRootDomain(credential.url);
      const credDomain = credential.url;
      if (credDomain === domain || credDomain === pageRootDomain) {
        return true;
      }
      if (credRootDomain === pageRootDomain) {
        return true;
      }
      if (domain.includes(credRootDomain) && domain !== credRootDomain) {
        return true;
      }
      return false;
    }).map((credential) => ({
      id: credential.id,
      title: credential.title,
      username: credential.username,
      url: credential.url
    }));
  } catch (error) {
    console.error("[AutofillBridge] Error finding matching credentials:", error);
    return [];
  }
}
function getCredentialForInjection(credentialId) {
  try {
    if (!isAutofillAvailable()) {
      console.log("[AutofillBridge] No valid session for credential injection");
      return null;
    }
    const credentialsStore = useCredentialsStore.getState();
    return credentialsStore.credentials.find((c) => c.id === credentialId) || null;
  } catch (error) {
    console.error("[AutofillBridge] Error getting credential for injection:", error);
    return null;
  }
}
async function restoreVaultForAutofill() {
  try {
    await loadVaultIfNeeded();
    return true;
  } catch (error) {
    console.error("[AutofillBridge] Error restoring vault:", error);
    return false;
  }
}
const pageState = {};
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const activeContentScriptTabs = /* @__PURE__ */ new Set();
async function ensureVaultLoaded() {
  try {
    await loadVaultIfNeeded();
    return true;
  } catch (error) {
    console.error("[Background] Failed to load vault:", error);
    return false;
  }
}
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
    ensureVaultLoaded();
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
    (async () => {
      await ensureVaultLoaded();
      const isValid = isAutofillAvailable();
      sendResponse({ isValid });
    })();
    return true;
  }
  if (msg.type === "GET_MATCHING_CREDENTIALS" && msg.domain) {
    (async () => {
      await ensureVaultLoaded();
      const matchingCredentials = getMatchingCredentials(msg.domain);
      sendResponse({ credentials: matchingCredentials });
    })();
    return true;
  }
  if (msg.type === "INJECT_CREDENTIAL" && msg.credentialId && sender.tab?.id) {
    (async () => {
      try {
        const credential = getCredentialForInjection(msg.credentialId);
        if (!credential) {
          sendResponse({ success: false, error: "Credential not found or vault not loaded" });
          return;
        }
        if (sender.tab && typeof sender.tab.id === "number") {
          chrome.tabs.sendMessage(sender.tab.id, {
            type: "INJECT_CREDENTIAL",
            username: credential.username,
            password: credential.password
          });
        }
        sendResponse({ success: true });
      } catch (error) {
        console.error("[Background] Error injecting credential:", error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    })();
    return true;
  }
  if (msg.type === "RESTORE_VAULT") {
    (async () => {
      try {
        const restored = await restoreVaultForAutofill();
        sendResponse({ success: restored });
      } catch (error) {
        console.error("[Background] Error restoring vault:", error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
      }
    })();
    return true;
  }
  if (msg.type === "SYNC_VAULT" && msg.vaultData) {
    (async () => {
      try {
        const { setCredentialsInMemory, setBankCardsInMemory, setSecureNotesInMemory } = await __vitePreload(async () => {
          const { setCredentialsInMemory: setCredentialsInMemory2, setBankCardsInMemory: setBankCardsInMemory2, setSecureNotesInMemory: setSecureNotesInMemory2 } = await import("./assets/memory-B8-2f7qf.js");
          return { setCredentialsInMemory: setCredentialsInMemory2, setBankCardsInMemory: setBankCardsInMemory2, setSecureNotesInMemory: setSecureNotesInMemory2 };
        }, true ? [] : void 0);
        setCredentialsInMemory(msg.vaultData.credentials || []);
        setBankCardsInMemory(msg.vaultData.bankCards || []);
        setSecureNotesInMemory(msg.vaultData.secureNotes || []);
        console.log("[Background] Vault synced from popup");
        sendResponse({ success: true });
      } catch (error) {
        console.error("[Background] Error syncing vault from popup:", error);
        sendResponse({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
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
chrome.runtime.onStartup.addListener(() => {
  console.log("[Background] Extension started, loading vault...");
  ensureVaultLoaded();
});
chrome.runtime.onInstalled.addListener(() => {
  console.log("[Background] Extension installed/updated, loading vault...");
  ensureVaultLoaded();
});
chrome.tabs.onActivated.addListener(() => {
  console.log("[Background] Tab activated, ensuring vault is loaded...");
  ensureVaultLoaded();
});
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    console.log("[Background] Tab updated, ensuring vault is loaded for tab:", tabId);
    ensureVaultLoaded();
  }
});
//# sourceMappingURL=background.js.map
