// const DEBUG_MODE_LOCALSTORAGE_ID = 'IS_DEBUG_MODE';

// window.JS_SCRIPTS = new Set();
// window.IS_DEBUG_MODE = getDebugMode();

// export const SCRIPTS_LOADED_EVENT = 'scriptsLoaded';

// const LOCALHOST_BASE = 'http://localhost:3000/';
// // const EXTERNAL_SERVER_LOAD_BASE = 'https://cdn.jsdelivr.net/gh/witholdfriends/deck-docs/dist/';
// const EXTERNAL_SERVER_LOAD_BASE = 'https://cdn.jsdelivr.net/gh/jaiswalvishal86/deck-doctor-main@1.0.0/dist';

// const SCRIPT_LOAD_PROMISES: Array<Promise<unknown>> = [];

// const LOCALHOST_CONNECTION_TIMEOUT_IN_MS = 200;
// const localhostFetchController = new AbortController();

// /**
//  * Sets an object `window.isLocal` and adds all the set scripts using the `window.JS_SCRIPTS` Set
//  */
// function addJS() {
//   window.isLocal = false;

//   const localhostFetchTimeout = setTimeout(() => {
//     localhostFetchController.abort();
//   }, LOCALHOST_CONNECTION_TIMEOUT_IN_MS);

//   fetch(LOCALHOST_BASE, { signal: localhostFetchController.signal })
//     .then((response) => {
//       if (response.ok) {
//         window.isLocal = true;
//       }
//     })
//     .catch(() => {
//       window.DEBUG('localhost not resolved');
//     })
//     .finally(() => {
//       clearTimeout(localhostFetchTimeout);

//       appendScripts();
//     });
// }

// function appendScripts() {
//   const base = window.isLocal ? LOCALHOST_BASE : EXTERNAL_SERVER_LOAD_BASE;
//   window.JS_SCRIPTS?.forEach((url) => {
//     const script = document.createElement('script');
//     script.src = base + url;
//     script.defer = true;

//     const promise = new Promise((resolve, reject) => {
//       script.onload = resolve;
//       script.onerror = () => {
//         console.error(`Failed to load script: ${url}`);
//         reject;
//       };
//     });

//     SCRIPT_LOAD_PROMISES.push(promise);

//     document.body.appendChild(script);
//   });

//   Promise.allSettled(SCRIPT_LOAD_PROMISES).then(() => {
//     window.DEBUG('all scripts loaded');
//     window.dispatchEvent(new CustomEvent(SCRIPTS_LOADED_EVENT));
//   });
// }

// // init adding scripts to the page
// window.addEventListener('DOMContentLoaded', addJS);

// window.Webflow = window.Webflow || [];
// window.Webflow.push(() => {});

// window.setDebugMode = (mode) => {
//   localStorage.setItem(DEBUG_MODE_LOCALSTORAGE_ID, mode.toString());
// };

// function getDebugMode(): boolean {
//   const localStorageItem = localStorage.getItem(DEBUG_MODE_LOCALSTORAGE_ID);
//   if (localStorageItem && localStorageItem === 'true') {
//     return true;
//   }
//   return false;
// }

// window.DEBUG = function (...args) {
//   if (window.IS_DEBUG_MODE) {
//     console.log(...args);
//   }
// };

/**
 * Entry point for the build system.
 * Polls `localhost` on page load, else falls back to deriving code from production URL
 */

const DEBUG_MODE_LOCALSTORAGE_ID = 'IS_DEBUG_MODE';

window.JS_SCRIPTS = new Set();
window.IS_DEBUG_MODE = getDebugMode();

export const SCRIPTS_LOADED_EVENT = 'scriptsLoaded';

const LOCALHOST_BASE = 'http://localhost:3000/';
// const EXTERNAL_SERVER_LOAD_BASE = 'https://cdn.jsdelivr.net/gh/witholdfriends/deck-docs/dist/';
// Use jsDelivr which provides public access without authorization
const EXTERNAL_SERVER_LOAD_BASE = 'https://cdn.jsdelivr.net/gh/jaiswalvishal86/deck-doctor-main@1.0.0/dist/';

const SCRIPT_LOAD_PROMISES: Array<Promise<unknown>> = [];

const LOCALHOST_CONNECTION_TIMEOUT_IN_MS = 200;

/**
 * Sets an object `window.isLocal` and adds all the set scripts using the `window.JS_SCRIPTS` Set
 */
function addJS() {
  window.isLocal = false;

  const localhostFetchController = new AbortController();
  const localhostFetchTimeout = setTimeout(() => {
    localhostFetchController.abort();
  }, LOCALHOST_CONNECTION_TIMEOUT_IN_MS);

  // Try to connect to localhost first - include credentials only for localhost
  fetch(LOCALHOST_BASE, {
    signal: localhostFetchController.signal,
    // Only include credentials for localhost, not for CDN requests
    credentials: 'same-origin',
    // Use no-cors mode to avoid preflight requests
    mode: 'no-cors',
  })
    .then((response) => {
      if (response.ok) {
        window.isLocal = true;
      }
    })
    .catch(() => {
      window.DEBUG('localhost not resolved');
    })
    .finally(() => {
      clearTimeout(localhostFetchTimeout);
      appendScripts();
    });
}

function appendScripts() {
  const base = window.isLocal ? LOCALHOST_BASE : EXTERNAL_SERVER_LOAD_BASE;
  const timestamp = Date.now(); // Add cache-busting parameter

  window.JS_SCRIPTS?.forEach((url) => {
    const script = document.createElement('script');
    // Add cache-busting query parameter to avoid caching issues
    script.src = `${base}${url}?t=${timestamp}`;
    script.defer = true;

    // Use anonymous for crossOrigin to avoid sending credentials
    script.crossOrigin = 'anonymous';

    const promise = new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = (error) => {
        console.error(`Failed to load script: ${url}`, error);

        // If loading from external server fails, try an alternative CDN
        if (!window.isLocal) {
          const alternativeScript = document.createElement('script');
          alternativeScript.src = `https://cdn.jsdelivr.net/gh/jaiswalvishal86/deck-doctor-main@1.0.0/dist/${url}?t=${timestamp}`;
          alternativeScript.defer = true;
          alternativeScript.crossOrigin = 'anonymous';

          alternativeScript.onload = resolve;
          alternativeScript.onerror = reject;

          document.body.appendChild(alternativeScript);
        } else {
          reject(error);
        }
      };
    });

    SCRIPT_LOAD_PROMISES.push(promise);
    document.body.appendChild(script);
  });

  Promise.allSettled(SCRIPT_LOAD_PROMISES).then(() => {
    window.DEBUG('all scripts loaded');
    window.dispatchEvent(new CustomEvent(SCRIPTS_LOADED_EVENT));
  });
}

// init adding scripts to the page
window.addEventListener('DOMContentLoaded', addJS);

window.Webflow = window.Webflow || [];
window.Webflow.push(() => {});

window.setDebugMode = (mode) => {
  localStorage.setItem(DEBUG_MODE_LOCALSTORAGE_ID, mode.toString());
};

function getDebugMode(): boolean {
  const localStorageItem = localStorage.getItem(DEBUG_MODE_LOCALSTORAGE_ID);
  if (localStorageItem && localStorageItem === 'true') {
    return true;
  }
  return false;
}

window.DEBUG = (...args) => {
  if (window.IS_DEBUG_MODE) {
    console.log(...args);
  }
};
