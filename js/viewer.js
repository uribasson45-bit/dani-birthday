// ─────────────────────────────────────────────
// STARS BACKGROUND
// ─────────────────────────────────────────────

(function createStars() {
  var c = document.getElementById('stars');

  for (var i = 0; i < 80; i++) {
    var s = document.createElement('div');

    s.className = 'star';

    var sz = Math.random() * 2.5 + 0.5;

    s.style.cssText =
      'width:' + sz + 'px;' +
      'height:' + sz + 'px;' +
      'left:' + (Math.random() * 100) + '%;' +
      'top:' + (Math.random() * 100) + '%;' +
      '--d:' + (2 + Math.random() * 4) + 's;' +
      '--delay:' + (Math.random() * 4) + 's;' +
      'opacity:' + (Math.random() * 0.5);

    c.appendChild(s);
  }
})();


// ─────────────────────────────────────────────
// SIDE PROGRESS
// ─────────────────────────────────────────────

function renderSideProgress() {
  var sp = document.getElementById('side-progress');
  var cur = state.currentPage;

  sp.innerHTML = '';

  state.pages.forEach(function(p, i) {
    var pip = document.createElement('div');

    if (i === cur) {
      pip.className = 'sp-pip sp-active';
    }
    else if (i < cur) {
      pip.className = 'sp-pip sp-done';
    }
    else if (p.locked) {
      pip.className = 'sp-pip sp-locked';
    }
    else {
      pip.className = 'sp-pip';
    }

    pip.title =
      p.name +
      (p.locked && i > cur ? ' 🔒' : '');

    sp.appendChild(pip);
  });


  var lbl = document.createElement('div');

  lbl.className = 'sp-label';

  lbl.textContent =
    (cur + 1) +
    '/' +
    state.pages.length;

  sp.appendChild(lbl);
}


// ─────────────────────────────────────────────
// MAIN VIEWER
// ─────────────────────────────────────────────

function renderViewer() {

  var wrap =
    document.getElementById('pages-wrap');

  var pb =
    document.getElementById('progress-bar');

  var counter =
    document.getElementById('page-counter');


  // Protect against invalid / locked current page.
  normalizeCurrentPage();


  var cur = state.currentPage;
  var total = state.pages.length;


  // ─────────────────────────────────────────
  // EMPTY STORY PROTECTION
  // ─────────────────────────────────────────

  if (!total) {
    wrap.innerHTML = '';
    pb.innerHTML = '';
    counter.textContent = '0 / 0';

    document
      .getElementById('btn-prev')
      .disabled = true;

    document
      .getElementById('btn-next')
      .disabled = true;

    renderSideProgress();

    return;
  }


  // ─────────────────────────────────────────
  // TOP PROGRESS BAR
  // ─────────────────────────────────────────

  pb.innerHTML = '';

  state.pages.forEach(function(p, i) {

    var d =
      document.createElement('div');

    var cls =
      'prog-dot';


    if (i === cur) {
      cls += ' active';
    }
    else if (i < cur) {
      cls += ' done';
    }
    else if (p.locked) {
      cls += ' is-locked';
    }


    d.className = cls;

    d.title =
      p.name +
      (p.locked && i > cur ? ' 🔒' : '');


    (function(pageIdx) {

      d.addEventListener(
        'click',
        function() {

          if (pageIdx === state.currentPage) {
            return;
          }

          // Backwards is allowed.
          if (pageIdx < state.currentPage) {
            navigateTo(pageIdx);
            return;
          }

          // Forward pages must be unlocked.
          if (isPageLocked(pageIdx)) {
            notify('🔒 הדף עדיין נעול');
            return;
          }

          navigateTo(pageIdx);
        }
      );

    })(i);


    pb.appendChild(d);
  });


  counter.textContent =
    (cur + 1) +
    ' / ' +
    total;


  // ─────────────────────────────────────────
  // STORY PAGES
  // ─────────────────────────────────────────

  wrap.innerHTML = '';


  state.pages.forEach(function(page, i) {

    var el =
      document.createElement('div');


    if (i === cur) {
      el.className =
        'page active';
    }
    else if (i < cur) {
      el.className =
        'page exit-left';
    }
    else {
      el.className =
        'page exit-right';
    }


    el.dataset.idx = i;


    // Background
    applyPageBackground(
      el,
      page.background
    );


    // Page elements
    page.elements.forEach(function(e) {
      el.appendChild(
        buildViewElement(e)
      );
    });


    /*
     * Locked pages are visually protected.
     *
     * Normally the user cannot navigate into them,
     * but keeping this overlay gives us an additional
     * visual safeguard.
     */
    if (
      page.locked &&
      i !== cur
    ) {

      var lo =
        document.createElement('div');

      lo.className =
        'lock-overlay';


      lo.innerHTML =
        '<div class="lock-icon">' +
          '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.8">' +
            '<rect x="3" y="11" width="18" height="11" rx="2"/>' +
            '<path d="M7 11V7a5 5 0 0 1 10 0v4"/>' +
          '</svg>' +
        '</div>' +

        '<div class="lock-label">' +
          'הדף נעול' +
        '</div>' +

        '<div class="lock-hint">' +
          'דף זה טרם נפתח' +
        '</div>';


      el.appendChild(lo);
    }


    wrap.appendChild(el);
  });


  // ─────────────────────────────────────────
  // BUTTON STATES
  // ─────────────────────────────────────────

  var nextPageLocked =
    cur < total - 1 &&
    state.pages[cur + 1] &&
    state.pages[cur + 1].locked;


  document
    .getElementById('btn-prev')
    .disabled =
      (cur <= 0);


  document
    .getElementById('btn-next')
    .disabled =
      (
        cur >= total - 1 ||
        nextPageLocked
      );


  renderSideProgress();
}


// ─────────────────────────────────────────────
// PAGE BACKGROUND
// ─────────────────────────────────────────────

function applyPageBackground(el, bg) {

  if (
    !bg ||
    bg.type === 'none'
  ) {

    el.style.background = '';

    return;
  }


  if (bg.type === 'color') {

    el.style.background =
      bg.value;
  }

  else if (bg.type === 'image') {

    el.style.background =
      "url('" +
      bg.value +
      "') center/cover no-repeat";
  }
}