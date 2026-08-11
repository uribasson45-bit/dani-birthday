// ─────────────────────────────────────────────
// APPLICATION BOOTSTRAP
// ─────────────────────────────────────────────

loadState();

/*
 * Protect the viewer from starting on a page
 * that Admin has since locked.
 */
normalizeCurrentPage();

renderViewer();