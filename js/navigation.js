// ============================================================
// NAVIGATION
// Reliable mouse + touch navigation.
// ============================================================

function isPageLocked(idx) {
  return !!(
    state.pages[idx] &&
    state.pages[idx].locked
  );
}

function syncStoryHistory(idx, mode) {
  try {
    var data = { storyPage: idx };
    var url = '#p' + (idx + 1);

    if (mode === 'push') {
      history.pushState(data, '', url);
    } else {
      history.replaceState(data, '', url);
    }
  } catch (e) {
    // History support is optional. Story navigation must still work.
  }
}

function navigateTo(idx, historyMode) {
  if (idx < 0 || idx >= state.pages.length) return false;

  // Forward movement into a locked page is blocked.
  if (
    idx > state.currentPage &&
    isPageLocked(idx)
  ) {
    notify('🔒 הדף נעול');
    return false;
  }

  state.currentPage = idx;
  renderViewer();

  if (historyMode) {
    syncStoryHistory(idx, historyMode);
  }

  return true;
}

function goNext() {
  var nextIdx = state.currentPage + 1;

  if (nextIdx >= state.pages.length) return;

  navigateTo(nextIdx, 'push');
}

function goPrev() {
  var prevIdx = state.currentPage - 1;

  if (prevIdx < 0) return;

  /*
   * IMPORTANT:
   * Do not use history.back() for the visible Previous button.
   *
   * On mobile Safari / in-app browsers the browser history may not
   * correspond exactly to the story page history. The UI control must
   * always change the story page directly.
   */
  navigateTo(prevIdx, 'replace');
}


// ============================================================
// BROWSER BACK / FORWARD
// ============================================================

window.addEventListener('popstate', function(ev) {
  // If browser Back is pressed while Admin is open, close Admin first.
  if (adminMode) {
    exitAdmin();
    return;
  }

  var target = null;

  if (
    ev.state &&
    typeof ev.state.storyPage === 'number'
  ) {
    target = ev.state.storyPage;
  } else {
    // Fallback: understand our #pN hash if browser state is missing.
    var match = String(location.hash || '').match(/^#p(\d+)$/);

    if (match) {
      target = parseInt(match[1], 10) - 1;
    }
  }

  if (target === null || isNaN(target)) return;
  if (target < 0 || target >= state.pages.length) return;

  /*
   * Browser back navigation should never trap the user.
   * Going backwards is always allowed.
   */
  if (target <= state.currentPage) {
    state.currentPage = target;
    renderViewer();
    return;
  }

  // Browser Forward still respects page locks.
  navigateTo(target, null);
});


// ============================================================
// VIEWER BUTTONS
// ============================================================

var nextBtn = document.getElementById('btn-next');
var prevBtn = document.getElementById('btn-prev');

if (nextBtn) {
  nextBtn.addEventListener('click', function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    goNext();
  });
}

if (prevBtn) {
  prevBtn.addEventListener('click', function(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    goPrev();
  });
}

/*
 * Do NOT add a second touchend handler here.
 *
 * Mobile browsers already generate a normal click for a tap.
 * Having both touchend and click can cause duplicate navigation,
 * cancelled taps, or inconsistent behavior between Safari/Chrome.
 */


// ============================================================
// TOUCH SWIPE
// ============================================================

(function initSwipeNavigation() {
  var wrap = document.getElementById('pages-wrap');

  if (!wrap) return;

  wrap.addEventListener('touchstart', function(ev) {
    if (adminMode) return;
    if (ev.touches.length !== 1) return;

    _touchStartX = ev.touches[0].clientX;
    _touchStartY = ev.touches[0].clientY;
    _touchStartT = Date.now();
  }, { passive: true });

  wrap.addEventListener('touchend', function(ev) {
    if (adminMode) return;
    if (ev.changedTouches.length !== 1) return;

    var dx = ev.changedTouches[0].clientX - _touchStartX;
    var dy = ev.changedTouches[0].clientY - _touchStartY;
    var dt = Date.now() - _touchStartT;

    // Horizontal-dominant swipe, at least 40px, finished within 600ms.
    if (
      Math.abs(dx) > Math.abs(dy) * 1.2 &&
      Math.abs(dx) > 40 &&
      dt < 600
    ) {
      if (dx < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  }, { passive: true });
})();


// ============================================================
// KEYBOARD
// ============================================================

document.addEventListener('keydown', function(ev) {
  if (adminMode) return;

  // RTL story direction
  if (ev.key === 'ArrowRight') goPrev();
  if (ev.key === 'ArrowLeft')  goNext();
});
