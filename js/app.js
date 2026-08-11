// ============================================================
// BOOTSTRAP
// ============================================================
try { history.replaceState({ storyPage: 0 }, '', location.pathname + location.search); } catch(e) {}
loadState().then(function() {
  renderViewer();
}).catch(function() {
  renderViewer();
});
