window.addEventListener('error', function(e) {
  document.body.innerHTML = '<div style="color:red;padding:20px;z-index:9999;position:fixed;top:0;left:0;background:white;"><h1>Error: ' + e.message + '</h1><pre>' + e.error.stack + '</pre></div>';
});
window.addEventListener('unhandledrejection', function(e) {
  document.body.innerHTML = '<div style="color:red;padding:20px;z-index:9999;position:fixed;top:0;left:0;background:white;"><h1>Unhandled Rejection: ' + e.reason + '</h1></div>';
});
