// js/config.js - Runtime configuration and logging controls
(function initRuntimeConfig() {
  const isLocalhost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname);
  const isFileProtocol = window.location.protocol === 'file:';
  const isDevFlag = /[?&]dev(=true)?/i.test(window.location.search);

  const isDevelopment = isLocalhost || isFileProtocol || isDevFlag;

  // Expose minimal global config
  window.APP_CONFIG = {
    environment: isDevelopment ? 'development' : 'production',
    disableLogs: !isDevelopment
  };

  // Preserve originals
  const originalConsole = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    debug: console.debug.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console)
  };

  function noOp() {}

  function applyLogLevel(disable) {
    if (disable) {
      console.log = noOp;
      console.info = noOp;
      console.debug = noOp;
      // keep warn and error visible in production
    } else {
      console.log = originalConsole.log;
      console.info = originalConsole.info;
      console.debug = originalConsole.debug;
      console.warn = originalConsole.warn;
      console.error = originalConsole.error;
    }
    window.APP_CONFIG.disableLogs = disable;
  }

  // Apply initial setting
  applyLogLevel(!isDevelopment);

  // Provide toggles for ad-hoc debugging in production
  window.enableLogs = function enableLogs() { applyLogLevel(false); };
  window.disableLogs = function disableLogs() { applyLogLevel(true); };
})();
