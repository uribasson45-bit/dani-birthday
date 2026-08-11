// ============================================================
// NAVIGATION (with real browser history so Back always works)
// ============================================================
function navigateTo(idx, pushHistory) {
  if (idx < 0 || idx >= state.pages.length) return;

  if (idx > state.currentPage && state.pages[idx] && state.pages[idx].locked) {
    notify('🔒 הדף נעול');
    return;
  }

  state.currentPage = idx;
  renderViewer();
  if (pushHistory) {
    try { history.pushState({ storyPage: idx }, '', '#p' + (idx+1)); } catch(e) {}
  }
}

function goNext() { navigateTo(state.currentPage + 1, true); }
function goPrev() {
  // Backward navigation is ALWAYS allowed, even from a locked page,
  // and it also drives the browser/OS Back button via popstate below.
  if (state.currentPage <= 0) return;
  try { history.back(); } catch(e) { navigateTo(state.currentPage - 1, true); }
}

// The actual page change on Back/Forward happens here, so the phone's
// hardware/gesture back button and the browser's Back button both work
// correctly, including when the user is standing on a locked page.
window.addEventListener('popstate', function(ev) {
  if (adminMode) { exitAdmin(); return; }
  var target = (ev.state && typeof ev.state.storyPage === 'number') ? ev.state.storyPage : (state.currentPage - 1);
  if (target < 0) target = 0;
  // Popping back is always allowed regardless of lock state.
  if (target <= state.currentPage) {
    state.currentPage = target;
    renderViewer();
  } else {
    navigateTo(target, false);
  }
});

document.getElementById('btn-next').addEventListener('click', goNext);
document.getElementById('btn-prev').addEventListener('click', goPrev);
document.getElementById('btn-next').addEventListener('touchend', function(e) { e.preventDefault(); goNext(); });
document.getElementById('btn-prev').addEventListener('touchend', function(e) { e.preventDefault(); goPrev(); });

// ─── TOUCH SWIPE ───
(function() {
  var wrap = document.getElementById('pages-wrap');
  wrap.addEventListener('touchstart', function(ev) {
    if (ev.touches.length !== 1) return;
    _touchStartX = ev.touches[0].clientX;
    _touchStartY = ev.touches[0].clientY;
    _touchStartT = Date.now();
  }, { passive: true });
  wrap.addEventListener('touchend', function(ev) {
    if (ev.changedTouches.length !== 1) return;
    var dx = ev.changedTouches[0].clientX - _touchStartX;
    var dy = ev.changedTouches[0].clientY - _touchStartY;
    var dt = Date.now() - _touchStartT;
    if (Math.abs(dx) > Math.abs(dy) * 1.2 && Math.abs(dx) > 40 && dt < 500) {
      if (dx < 0) goNext();
      else        goPrev();
    }
  }, { passive: true });
})();

document.addEventListener('keydown', function(ev) {
  if (adminMode) return;
  if (ev.key === 'ArrowRight') goPrev();
  if (ev.key === 'ArrowLeft')  goNext();
});
