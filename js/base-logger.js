// js/base-logger.js
window.addEventListener('error', e => console.error('[WindowError]', e.message || e.error));
window.addEventListener('unhandledrejection', e => console.error('[UnhandledRejection]', e.reason));
