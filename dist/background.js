/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 1261:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   af: () => (/* binding */ decryptData),
/* harmony export */   yv: () => (/* binding */ encryptData)
/* harmony export */ });
/* unused harmony exports base64UrlToBytes, bytesToBase64, base64ToBytes, deriveKey, generateItemKey */
/* harmony import */ var _stablelib_chacha20poly1305__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2065);
/* harmony import */ var _stablelib_random__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9726);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// utils/crypto.ts


function base64UrlToBytes(base64url) {
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4)
        base64 += '=';
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}
function bytesToBase64(bytes) {
    return btoa(String.fromCharCode(...bytes));
}
function base64ToBytes(base64) {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}
function deriveKey(masterPassword, saltBase64Url) {
    return __awaiter(this, void 0, void 0, function* () {
        const salt = base64UrlToBytes(saltBase64Url);
        const enc = new TextEncoder();
        const passwordKey = yield window.crypto.subtle.importKey('raw', enc.encode(masterPassword), { name: 'PBKDF2' }, false, ['deriveBits']);
        const derivedBits = yield window.crypto.subtle.deriveBits({
            name: 'PBKDF2',
            salt: salt,
            iterations: 300000,
            hash: 'SHA-256',
        }, passwordKey, 256);
        const derivedKey = bytesToBase64(new Uint8Array(derivedBits))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        return derivedKey;
    });
}
// Encrypts data using ChaCha20-Poly1305, returns standard base64 (with padding), to match Flutter implementation
function encryptData(symmetricKey, plainText) {
    const key = base64UrlToBytes(symmetricKey);
    const algo = new _stablelib_chacha20poly1305__WEBPACK_IMPORTED_MODULE_0__/* .ChaCha20Poly1305 */ .g6(key);
    const nonce = (0,_stablelib_random__WEBPACK_IMPORTED_MODULE_1__/* .randomBytes */ .po)(12);
    const plaintextBytes = new TextEncoder().encode(plainText);
    const encrypted = algo.seal(nonce, plaintextBytes);
    const result = new Uint8Array(nonce.length + encrypted.length);
    result.set(nonce, 0);
    result.set(encrypted, nonce.length);
    // Standard base64 with padding
    return btoa(String.fromCharCode(...result));
}
function decryptData(symmetricKey, encryptedData) {
    const key = base64UrlToBytes(symmetricKey);
    const algo = new _stablelib_chacha20poly1305__WEBPACK_IMPORTED_MODULE_0__/* .ChaCha20Poly1305 */ .g6(key);
    const encryptedBytes = base64ToBytes(encryptedData);
    const nonce = encryptedBytes.slice(0, 12);
    const ciphertextAndMac = encryptedBytes.slice(12);
    const decrypted = algo.open(nonce, ciphertextAndMac);
    if (!decrypted)
        throw new Error('Decryption failed');
    return new TextDecoder().decode(decrypted);
}
// Generates a 32-byte random item key, base64url encoded (no padding), to match Flutter implementation
function generateItemKey() {
    const key = window.crypto.getRandomValues(new Uint8Array(32));
    // Standard base64
    const base64 = btoa(String.fromCharCode(...key));
    // Convert to base64url (no padding)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}


/***/ }),

/***/ 2193:
/***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {

/* harmony import */ var features_credentials_services_items__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1036);
/* harmony import */ var shared_utils_crypto__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1261);
/* harmony import */ var features_auth_services_user__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5211);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



/**
 * Stores page info per tab.
 */
const pageState = {};
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // Do not initialize Firebase on every message
    var _a;
    // Store page info
    if (msg.type === 'PAGE_INFO' && ((_a = sender.tab) === null || _a === void 0 ? void 0 : _a.id) != null) {
        pageState[sender.tab.id] = { url: msg.url, domain: msg.domain, hasLoginForm: msg.hasLoginForm };
    }
    // Popup requests current page state
    if (msg.type === 'GET_PAGE_STATE' && msg.tabId != null) {
        sendResponse(pageState[msg.tabId] || null);
        return true;
    }
    // Popup requests credential injection
    if (msg.type === 'INJECT_CREDENTIAL' &&
        msg.credentialId &&
        sender.tab &&
        typeof sender.tab.id === 'number') {
        (0,features_credentials_services_items__WEBPACK_IMPORTED_MODULE_0__/* .getCredentialFromVaultDb */ .Q$)(msg.credentialId).then((cred) => __awaiter(void 0, void 0, void 0, function* () {
            if (cred) {
                // Decrypt password
                const userSecretKey = yield (0,features_auth_services_user__WEBPACK_IMPORTED_MODULE_2__/* .getUserSecretKey */ .jQ)();
                if (!userSecretKey) {
                    sendResponse({ success: false, error: 'User secret key not found' });
                    return;
                }
                const itemKey = yield (0,shared_utils_crypto__WEBPACK_IMPORTED_MODULE_1__/* .decryptData */ .af)(userSecretKey, cred.itemKeyCipher);
                const password = yield (0,shared_utils_crypto__WEBPACK_IMPORTED_MODULE_1__/* .decryptData */ .af)(itemKey, cred.passwordCipher);
                const tabId = sender.tab && typeof sender.tab.id === 'number' ? sender.tab.id : undefined;
                if (tabId !== undefined) {
                    chrome.tabs.sendMessage(tabId, {
                        type: 'INJECT_CREDENTIAL',
                        username: cred.username,
                        password,
                    });
                    sendResponse({ success: true });
                }
                else {
                    sendResponse({ success: false, error: 'Tab ID not found' });
                }
            }
            else {
                sendResponse({ success: false });
            }
        }));
        return true;
    }
    // Handle in-page picker credential request
    if (msg.type === 'GET_CACHED_CREDENTIALS' && msg.domain) {
        (0,features_credentials_services_items__WEBPACK_IMPORTED_MODULE_0__/* .getCredentialsByDomainFromVaultDb */ ._K)(msg.domain).then((creds) => {
            sendResponse(creds);
        });
        return true; // async
    }
    // Handle user secret key request from content script
    if (msg.type === 'GET_USER_SECRET_KEY') {
        (0,features_auth_services_user__WEBPACK_IMPORTED_MODULE_2__/* .getUserSecretKey */ .jQ)()
            .then((key) => {
            sendResponse({ key });
        })
            .catch(() => {
            sendResponse({ key: null });
        });
        return true;
    }
});
chrome.tabs.onActivated.addListener((activeInfo) => {
    const tabId = activeInfo.tabId;
    if (!pageState[tabId]) {
        // Ask the content script to send page info
        chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                const domain = window.location.hostname;
                const hasLogin = !!document.querySelector('form input[type="password"]');
                chrome.runtime.sendMessage({ type: 'PAGE_INFO', domain, hasLogin });
            },
        });
    }
});


/***/ }),

/***/ 5211:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   jQ: () => (/* binding */ getUserSecretKey)
/* harmony export */ });
/* unused harmony exports storeUserSecretKey, deleteUserSecretKey, loginUser, confirmMfa, logoutUser */
/* harmony import */ var services_api_firebase__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5553);
/* harmony import */ var services_api_cognito__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7581);
/* harmony import */ var services_storage_indexdb__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(4905);
/* harmony import */ var shared_utils_crypto__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1261);
/* harmony import */ var features_credentials_services_items__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1036);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * business/user.ts
 * High-level business logic for user authentication and user management.
 * Calls low-level service functions in services/cognito.ts and services/firebase.ts.
 */





const DB_NAME = 'SimpliPassCache';
const STORE_NAME = 'user';
const DB_VERSION = 1;
const REMEMBER_EMAIL_KEY = 'simplipass_remembered_email';
// Get user secret key from IndexedDB
function getUserSecretKey() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('[User] Getting user secret key from IndexedDB');
        const db = yield (0,services_storage_indexdb__WEBPACK_IMPORTED_MODULE_4__/* .openDB */ .P2)(DB_NAME, DB_VERSION);
        const result = yield (0,services_storage_indexdb__WEBPACK_IMPORTED_MODULE_4__/* .getItem */ .Gq)(db, STORE_NAME, 'UserSecretKey');
        console.log('[User] getUserSecretKey success:', result ? 'Key found: ' + result : 'Key not found');
        return result;
    });
}
// Store user secret key in IndexedDB
function storeUserSecretKey(key) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('[User] Storing user secret key in IndexedDB');
        const db = yield openDB(DB_NAME, DB_VERSION);
        yield putItem(db, STORE_NAME, 'UserSecretKey', key);
        console.log('[User] storeUserSecretKey success');
    });
}
// Delete user secret key from IndexedDB
function deleteUserSecretKey() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('[User] Deleting user secret key from IndexedDB');
        const db = yield openDB(DB_NAME, DB_VERSION);
        yield deleteItem(db, STORE_NAME, 'UserSecretKey');
        console.log('[User] deleteUserSecretKey success');
    });
}
// High-level login function for the popup.
// Handles email remembering, Cognito sign-in, MFA, secret key derivation, Firebase sign-in, and credential refresh.
function loginUser(_a) {
    return __awaiter(this, arguments, void 0, function* ({ email, password, rememberEmail, }) {
        console.log('[User] Starting login process for email:', email);
        // Remember email logic
        if (rememberEmail && email) {
            localStorage.setItem(REMEMBER_EMAIL_KEY, email);
        }
        else if (!rememberEmail) {
            localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
        // Call low-level Cognito login
        const result = yield loginWithCognito(email, password);
        if (result.mfaRequired) {
            console.log('[User] loginUser success: MFA required');
            return { mfaRequired: true, mfaUser: result.mfaUser };
        }
        // Derive and store user secret key
        const userSalt = result.userAttributes['custom:salt'];
        if (userSalt) {
            const userSecretKey = yield deriveKey(password, userSalt);
            yield storeUserSecretKey(userSecretKey);
        }
        // Sign in with Firebase (low-level)
        yield signInWithFirebaseToken(result.firebaseToken);
        yield refreshCredentialsInVaultDb(getCurrentUserFromFirebase());
        console.log('[User] loginUser success: User fully authenticated');
        return { mfaRequired: false };
    });
}
// High-level MFA confirmation function for the popup.
function confirmMfa(_a) {
    return __awaiter(this, arguments, void 0, function* ({ code, password, mfaUser, }) {
        console.log('[User] Confirming MFA with code');
        const result = yield confirmMfaWithCognito(code);
        const userSalt = result.userAttributes['custom:salt'];
        if (userSalt) {
            const userSecretKey = yield deriveKey(password, userSalt);
            yield storeUserSecretKey(userSecretKey);
        }
        yield signInWithFirebaseToken(result.firebaseToken);
        console.log('[User] confirmMfa success');
        return result.user;
    });
}
// High-level logout function for the popup.
function logoutUser() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('[User] Starting logout process');
        yield deleteUserSecretKey();
        yield clearStore(yield openDB(DB_NAME, DB_VERSION), STORE_NAME);
        yield signOutFromFirebase();
        yield signOutCognito();
        console.log('[User] logoutUser success');
    });
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/runtimeId */
/******/ 	(() => {
/******/ 		__webpack_require__.j = 471;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			471: 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunksimplipass_chrome_extension"] = self["webpackChunksimplipass_chrome_extension"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, [96,804,586,671], () => (__webpack_require__(2193)))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=background.js.map