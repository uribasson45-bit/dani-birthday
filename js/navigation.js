// ─────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────

function isPageLocked(idx) {
  return !!(
    state.pages[idx] &&
    state.pages[idx].locked
  );
}


// Finds the closest unlocked page going backwards.
// This prevents the viewer from getting stuck on a locked page.
function findPreviousUnlockedPage(fromIdx) {
  for (var i = fromIdx; i >= 0; i--) {
    if (!isPageLocked(i)) {
      return i;
    }
  }

  return 0;
}


// Makes sure currentPage is valid and not locked.
function normalizeCurrentPage() {
  if (!state.pages.length) {
    state.currentPage = 0;
    return;
  }

  if (state.currentPage < 0) {
    state.currentPage = 0;
  }

  if (state.currentPage >= state.pages.length) {
    state.currentPage = state.pages.length - 1;
  }

  // If Admin locked the current page,
  // move backwards to the closest unlocked page.
  if (isPageLocked(state.currentPage)) {
    state.currentPage =
      findPreviousUnlockedPage(state.currentPage - 1);
  }
}


// Main navigation function.
function navigateTo(idx) {
  if (idx < 0 || idx >= state.pages.length) {
    return;
  }

  // Moving forward into a locked page is forbidden.
  if (
    idx > state.currentPage &&
    isPageLocked(idx)
  ) {
    notify('🔒 הדף הבא עדיין נעול');
    return;
  }

  // Moving backwards is always allowed.
  state.currentPage = idx;

  renderViewer();
}


function goNext() {
  var nextIdx = state.currentPage + 1;

  if (nextIdx >= state.pages.length) {
    return;
  }

  if (isPageLocked(nextIdx)) {
    notify('🔒 הדף הבא עדיין נעול');
    return;
  }

  navigateTo(nextIdx);
}


function goPrev() {
  var prevIdx = state.currentPage - 1;

  if (prevIdx < 0) {
    return;
  }

  // Back navigation is always allowed.
  state.currentPage = prevIdx;

  renderViewer();
}


// ─────────────────────────────────────────────
// NAVIGATION BUTTONS
// ─────────────────────────────────────────────

document
  .getElementById('btn-next')
  .addEventListener('click', goNext);

document
  .getElementById('btn-prev')
  .addEventListener('click', goPrev);


// Touch support for iOS / mobile
document
  .getElementById('btn-next')
  .addEventListener('touchend', function(e) {
    e.preventDefault();
    goNext();
  });

document
  .getElementById('btn-prev')
  .addEventListener('touchend', function(e) {
    e.preventDefault();
    goPrev();
  });


// ─────────────────────────────────────────────
// SWIPE NAVIGATION
// ─────────────────────────────────────────────

(function initSwipeNavigation() {
  var wrap = document.getElementById('pages-wrap');

  wrap.addEventListener(
    'touchstart',
    function(ev) {
      if (ev.touches.length !== 1) {
        return;
      }

      _touchStartX = ev.touches[0].clientX;
      _touchStartY = ev.touches[0].clientY;
      _touchStartT = Date.now();
    },
    { passive: true }
  );


  wrap.addEventListener(
    'touchend',
    function(ev) {
      if (ev.changedTouches.length !== 1) {
        return;
      }

      var dx =
        ev.changedTouches[0].clientX - _touchStartX;

      var dy =
        ev.changedTouches[0].clientY - _touchStartY;

      var dt =
        Date.now() - _touchStartT;


      // Swipe must be mostly horizontal,
      // at least 40px and reasonably fast.
      if (
        Math.abs(dx) > Math.abs(dy) * 1.2 &&
        Math.abs(dx) > 40 &&
        dt < 500
      ) {

        if (dx < 0) {
          goNext();
        } else {
          goPrev();
        }
      }
    },
    { passive: true }
  );
})();


// ─────────────────────────────────────────────
// KEYBOARD NAVIGATION
// ─────────────────────────────────────────────

document.addEventListener(
  'keydown',
  function(ev) {

    // Disable client navigation while Admin is open.
    if (adminMode) {
      return;
    }

    if (ev.key === 'ArrowRight') {
      goPrev();
    }

    if (ev.key === 'ArrowLeft') {
      goNext();
    }
  }
);