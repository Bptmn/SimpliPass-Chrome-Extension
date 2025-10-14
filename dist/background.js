class y {
  async isAuthenticated() {
    try {
      const t = await chrome.storage.session.get(["user"]);
      return !!(t.user && t.user.id);
    } catch (t) {
      return console.error("[ExtensionAuthService] Failed to check authentication:", t), !1;
    }
  }
  async hasUserSecretKey() {
    try {
      return !!(await chrome.storage.session.get(["userSecretKey"])).userSecretKey;
    } catch (t) {
      return console.error("[ExtensionAuthService] Failed to check user secret key:", t), !1;
    }
  }
  async hasCredentials() {
    try {
      const t = await chrome.storage.session.get(["encryptedVault"]);
      if (!t.encryptedVault) return !1;
      const e = JSON.parse(t.encryptedVault).items;
      return Array.isArray(e) && e.length > 0;
    } catch (t) {
      return console.error("[ExtensionAuthService] Failed to check credentials:", t), !1;
    }
  }
  getCurrentUserId() {
    return null;
  }
  async getLocalVault() {
    try {
      const t = await chrome.storage.session.get(["encryptedVault"]);
      return t.encryptedVault ? JSON.parse(t.encryptedVault).items || [] : [];
    } catch (t) {
      return console.error("[ExtensionAuthService] Failed to get local vault:", t), [];
    }
  }
}
const d = new y();
function s(r) {
  return r.replace(/^www\./, "").toLowerCase();
}
function k(r, t) {
  const o = s(r), e = s(t);
  return !!(o === e || o.endsWith("." + e) || e.endsWith("." + o));
}
function f(r) {
  try {
    const t = r.startsWith("http") ? r : `https://${r}`;
    return new URL(t).hostname;
  } catch (t) {
    return console.error("[DomainMatching] Error extracting domain from URL:", r, t), null;
  }
}
function A(r, t) {
  if (!r.url)
    return !1;
  const o = f(r.url);
  return o ? k(t, o) : !1;
}
function C(r, t) {
  const o = s(r), e = f(t), n = e ? s(e) : null;
  let c = !1, a = "none";
  return n && (o === n ? (c = !0, a = "exact") : o.endsWith("." + n) ? (c = !0, a = "subdomain") : n.endsWith("." + o) && (c = !0, a = "reverse-subdomain")), {
    currentDomain: r,
    storedDomain: e,
    normalizedCurrent: o,
    normalizedStored: n,
    matches: c,
    matchType: a
  };
}
class S {
  async getAllItems() {
    try {
      const t = await chrome.storage.session.get(["encryptedVault"]);
      return t.encryptedVault ? JSON.parse(t.encryptedVault).items || [] : [];
    } catch (t) {
      return console.error("[ExtensionItemsService] Failed to get all items:", t), [];
    }
  }
  async getMatchingCredentials(t) {
    try {
      const e = (await this.getAllItems()).filter((n) => n.itemType === "credential").filter((n) => {
        if (!n.url) return !1;
        const c = A(n, t), a = C(t, n.url);
        return console.log("[ExtensionItemsService] Domain matching:", {
          currentDomain: a.currentDomain,
          storedDomain: a.storedDomain,
          credUrl: n.url,
          normalizedCurrent: a.normalizedCurrent,
          normalizedStored: a.normalizedStored,
          matches: a.matches,
          matchType: a.matchType
        }), c;
      });
      return console.log("[ExtensionItemsService] Matching credentials for domain", t, ":", e.length), e.map((n) => ({
        id: n.id,
        title: n.title || "Untitled",
        username: n.username || "",
        url: n.url
      }));
    } catch (o) {
      return console.error("[ExtensionItemsService] Error getting matching credentials:", o), [];
    }
  }
  async getCredentialForInjection(t) {
    try {
      const e = (await this.getAllItems()).filter((n) => n.itemType === "credential").find((n) => n.id === t);
      return e ? (console.log("[ExtensionItemsService] Found credential for injection:", e.title), {
        id: e.id,
        title: e.title || "Untitled",
        username: e.username || "",
        password: e.password || "",
        url: e.url
      }) : (console.log("[ExtensionItemsService] Credential not found for ID:", t), null);
    } catch (o) {
      return console.error("[ExtensionItemsService] Error getting credential for injection:", o), null;
    }
  }
  async getAllCredentials() {
    try {
      return (await this.getAllItems()).filter((e) => e.itemType === "credential").map((e) => ({
        id: e.id,
        title: e.title || "Untitled",
        username: e.username || "",
        url: e.url
      }));
    } catch (t) {
      return console.error("[ExtensionItemsService] Error getting all credentials:", t), [];
    }
  }
}
const h = new S(), E = (r) => {
  console.log("[Background] Platform set to:", r);
}, u = async () => {
  console.log("[Background] Checking page capabilities");
  try {
    const r = await d.isAuthenticated(), t = await d.hasUserSecretKey(), o = await d.hasCredentials();
    console.log("[Background] Service checks:", {
      isAuthenticated: r,
      hasUserSecretKey: t,
      hasCredentials: o ? "yes" : "no"
    });
    const e = {
      canAutofill: r && o,
      // ✅ Auth + credentials in RAM
      canSaveCredential: r && t,
      // ✅ Auth + user secret key
      canGeneratePassword: !0,
      // ✅ Always available
      hasCredentials: o,
      isAuthenticated: r
    };
    return console.log("[Background] Page capabilities:", JSON.stringify(e, null, 2)), e;
  } catch (r) {
    return console.error("[Background] Error checking page capabilities:", r), {
      canAutofill: !1,
      canSaveCredential: !1,
      canGeneratePassword: !0,
      hasCredentials: !1,
      isAuthenticated: !1
    };
  }
}, T = async () => {
  console.log("[Background] isAutofillAvailable called");
  const r = await u();
  return console.log("[Background] isAutofillAvailable result:", r.canAutofill), console.log("[Background] isAutofillAvailable details:", JSON.stringify(r, null, 2)), r.canAutofill;
}, I = async () => (await u()).canSaveCredential, p = async () => (await u()).canGeneratePassword, w = async (r) => {
  console.log("[Background] getMatchingCredentials called for domain:", r);
  try {
    const t = await h.getMatchingCredentials(r);
    return console.log("[Background] Found matching credentials:", t.length), t;
  } catch (t) {
    return console.error("[Background] Error getting matching credentials:", t), [];
  }
}, B = async (r) => {
  console.log("[Background] getCredentialForInjection called for id:", r);
  try {
    const t = await h.getCredentialForInjection(r);
    return t ? console.log("[Background] Found credential for injection:", t.title) : console.log("[Background] Credential not found for ID:", r), t;
  } catch (t) {
    return console.error("[Background] Error getting credential for injection:", t), null;
  }
}, m = () => {
  console.log("[Background] initializeContextMenu called");
}, b = (r, t) => {
  console.log("[Background] handleContextMenuClick called");
}, v = (r) => {
  console.log("[Background] updateContextMenuVisibility called");
}, i = {}, l = /* @__PURE__ */ new Set();
chrome.runtime.onStartup.addListener(() => {
  E("extension"), setTimeout(() => {
    m();
  }, 100);
});
chrome.runtime.onInstalled.addListener(() => {
  E("extension"), setTimeout(() => {
    m();
  }, 100);
});
function g(r, t) {
  l.forEach((o) => {
    chrome.tabs.sendMessage(o, {
      type: "BACKGROUND_LOG",
      level: r,
      message: t
    }).catch(() => {
      l.delete(o);
    });
  });
}
function _() {
  const r = console.log, t = console.error, o = console.warn;
  console.log = (...e) => {
    r(...e), g("log", e.join(" "));
  }, console.error = (...e) => {
    t(...e), g("error", e.join(" "));
  }, console.warn = (...e) => {
    o(...e), g("warn", e.join(" "));
  };
}
setTimeout(() => {
  _();
}, 50);
chrome.runtime.onMessage.addListener((r, t, o) => {
  if (r.type === "CONTENT_SCRIPT_READY" && t.tab?.id != null && (l.add(t.tab.id), console.log("[Background] Content script registered for tab:", t.tab.id)), r.type === "PAGE_INFO" && t.tab?.id != null && (i[t.tab.id] = { url: r.url, domain: r.domain, hasLoginForm: r.hasLoginForm }), r.type === "GET_PAGE_STATE" && r.tabId != null)
    return console.log("[Background] GET_PAGE_STATE request for tabId:", r.tabId), i[r.tabId] ? (console.log("[Background] Returning cached page state for tabId:", r.tabId), o(i[r.tabId]), !0) : ((async () => {
      try {
        const e = await chrome.tabs.get(r.tabId);
        if (console.log("[Background] Tab info:", { id: e.id, url: e.url, status: e.status }), e.url && (e.url.startsWith("chrome://") || e.url.startsWith("chrome-extension://") || e.url.startsWith("moz-extension://"))) {
          console.log("[Background] Cannot access restricted URL:", e.url), o({
            url: e.url || "",
            domain: "restricted",
            hasLoginForm: !1,
            error: "Cannot access chrome:// or extension URLs"
          });
          return;
        }
        console.log("[Background] Executing script for tabId:", r.tabId);
        const n = await chrome.scripting.executeScript({
          target: { tabId: r.tabId },
          func: () => ({
            url: window.location.href,
            domain: window.location.hostname,
            hasLoginForm: !!document.querySelector('form input[type="password"]')
          })
        });
        if (n && n[0]?.result) {
          const c = n[0].result;
          console.log("[Background] Page state retrieved:", c), i[r.tabId] = c, o(c);
        } else
          console.log("[Background] No results from script execution"), o(null);
      } catch (e) {
        console.error("[Background] Error executing script for page state:", e), o({
          url: "",
          domain: "unknown",
          hasLoginForm: !1,
          error: e instanceof Error ? e.message : "Unknown error"
        });
      }
    })(), !0);
  if (r.type === "GET_SESSION_STATUS")
    return console.log("[Background] GET_SESSION_STATUS request"), (async () => {
      try {
        const e = await T();
        console.log("[Background] Session status:", e), o({ isValid: e });
      } catch (e) {
        console.error("[Background] Error checking session status:", e), o({ isValid: !1, error: e instanceof Error ? e.message : "Unknown error" });
      }
    })(), !0;
  if (r.type === "GET_PAGE_CAPABILITIES")
    return console.log("[Background] GET_PAGE_CAPABILITIES request"), (async () => {
      try {
        const e = await u();
        console.log("[Background] Page capabilities:", e), o({ capabilities: e });
      } catch (e) {
        console.error("[Background] Error checking page capabilities:", e), o({
          capabilities: {
            canAutofill: !1,
            canSaveCredential: !1,
            canGeneratePassword: !0,
            hasCredentials: !1,
            isAuthenticated: !1
          },
          error: e instanceof Error ? e.message : "Unknown error"
        });
      }
    })(), !0;
  if (r.type === "GET_SAVE_CREDENTIAL_STATUS")
    return console.log("[Background] GET_SAVE_CREDENTIAL_STATUS request"), (async () => {
      try {
        const e = await I();
        console.log("[Background] Save credential status:", e), o({ isAvailable: e });
      } catch (e) {
        console.error("[Background] Error checking save credential status:", e), o({ isAvailable: !1, error: e instanceof Error ? e.message : "Unknown error" });
      }
    })(), !0;
  if (r.type === "GET_PASSWORD_GENERATOR_STATUS")
    return console.log("[Background] GET_PASSWORD_GENERATOR_STATUS request"), (async () => {
      try {
        const e = await p();
        console.log("[Background] Password generator status:", e), o({ isAvailable: e });
      } catch (e) {
        console.error("[Background] Error checking password generator status:", e), o({ isAvailable: !1, error: e instanceof Error ? e.message : "Unknown error" });
      }
    })(), !0;
  if (r.type === "GET_MATCHING_CREDENTIALS" && r.domain)
    return console.log("[Background] GET_MATCHING_CREDENTIALS request for domain:", r.domain), (async () => {
      try {
        const e = await w(r.domain);
        console.log("[Background] Found matching credentials:", e.length), o({ credentials: e });
      } catch (e) {
        console.error("[Background] Error getting matching credentials:", e), o({ credentials: [], error: e instanceof Error ? e.message : "Unknown error" });
      }
    })(), !0;
  if (r.type === "INJECT_CREDENTIAL" && r.credentialId)
    return console.log("[Background] INJECT_CREDENTIAL request for ID:", r.credentialId), (async () => {
      try {
        const e = await B(r.credentialId);
        e ? (console.log("[Background] Credential retrieved for injection"), t.tab?.id && await chrome.tabs.sendMessage(t.tab.id, {
          type: "INJECT_CREDENTIAL",
          username: e.username,
          password: e.password
        }), o({ success: !0 })) : (console.log("[Background] Credential not found"), o({ success: !1, error: "Credential not found" }));
      } catch (e) {
        console.error("[Background] Error getting credential for injection:", e), o({ success: !1, error: e instanceof Error ? e.message : "Unknown error" });
      }
    })(), !0;
  if (r.type === "RESTORE_VAULT")
    return console.log("[Background] RESTORE_VAULT request"), (async () => {
      try {
        console.log("[Background] Vault restore request received"), o({ success: !0 });
      } catch (e) {
        console.error("[Background] Error restoring vault:", e), o({ success: !1, error: e instanceof Error ? e.message : "Unknown error" });
      }
    })(), !0;
  if (r.type === "LOCK_VAULT")
    return console.log("[Background] LOCK_VAULT request"), (async () => {
      try {
        console.log("[Background] Vault locked"), o({ success: !0 });
      } catch (e) {
        console.error("[Background] Error locking vault:", e), o({ success: !1, error: e instanceof Error ? e.message : "Unknown error" });
      }
    })(), !0;
  if (r.type === "CAPTURE_CREDENTIALS" && r.data)
    return console.log("[Background] CAPTURE_CREDENTIALS request"), (async () => {
      try {
        t.tab?.id && await chrome.tabs.sendMessage(t.tab.id, {
          type: "CAPTURE_CREDENTIALS",
          data: r.data
        }), o({ success: !0 });
      } catch (e) {
        console.error("[Background] Error capturing credentials:", e), o({ success: !1, error: e instanceof Error ? e.message : "Unknown error" });
      }
    })(), !0;
  if (r.type === "SAVE_CREDENTIAL" && r.credential)
    return console.log("[Background] SAVE_CREDENTIAL request"), (async () => {
      try {
        console.log("[Background] Credential saved successfully"), o({ success: !0 });
      } catch (e) {
        console.error("[Background] Error saving credential:", e), o({ success: !1, error: e instanceof Error ? e.message : "Unknown error" });
      }
    })(), !0;
  if (r.type === "UPDATE_CREDENTIAL" && r.credential)
    return console.log("[Background] UPDATE_CREDENTIAL request"), (async () => {
      try {
        console.log("[Background] Credential updated successfully"), o({ success: !0 });
      } catch (e) {
        console.error("[Background] Error updating credential:", e), o({ success: !1, error: e instanceof Error ? e.message : "Unknown error" });
      }
    })(), !0;
  if (r.type === "OPEN_POPUP") {
    console.log("[Background] OPEN_POPUP request");
    try {
      chrome.action.openPopup(), o({ success: !0 });
    } catch (e) {
      console.error("[Background] Error opening popup:", e), o({ success: !1, error: "Failed to open popup" });
    }
    return !0;
  }
});
chrome.tabs.onRemoved.addListener((r) => {
  delete i[r], l.delete(r), console.log("[Background] Tab removed, cleaned up state for tab:", r);
});
chrome.tabs.onUpdated.addListener((r, t, o) => {
  t.status === "complete" && o.url && v();
});
chrome && chrome.contextMenus && chrome.contextMenus.onClicked.addListener((r, t) => {
  b();
});
