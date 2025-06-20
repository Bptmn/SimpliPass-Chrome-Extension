/******/ (() => { // webpackBootstrap
console.log('HTML head loaded');
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired');
});
 
console.log('Before popup.js load');
window.addEventListener('load', () => {
  console.log('After popup.js load');
}); 
/******/ })()
;
//# sourceMappingURL=init.js.map