// ============================================================
// ADMIN LOGIN
// ============================================================

document.getElementById('admin-trigger').addEventListener('click', function() {
  if (adminMode) {
    exitAdmin();
    return;
  }

  var loginEl = document.getElementById('admin-login');

  loginEl.style.display = 'flex';

  document.getElementById('login-pw').value = '';
  document.getElementById('login-err').textContent = '';

  setTimeout(function() {
    document.getElementById('login-pw').focus();
  }, 100);
});

document.getElementById('login-btn').addEventListener('click', doLogin);

document.getElementById('login-pw').addEventListener('keydown', function(ev) {
  if (ev.key === 'Enter') doLogin();
});

function doLogin() {
  var pw = document.getElementById('login-pw').value;

  if (pw === ADMIN_PASSWORD) {
    document.getElementById('admin-login').style.display = 'none';
    enterAdmin();
  } else {
    document.getElementById('login-err').textContent =
      'סיסמה שגויה, נסה שוב';

    document.getElementById('login-pw').value = '';
  }
}


// ============================================================
// ADMIN MODE
// ============================================================

function enterAdmin() {
  adminMode = true;

  var panel = document.getElementById('admin-panel');

  panel.style.display = 'flex';

  // Always edit a valid page.
  if (
    state.currentPage >= 0 &&
    state.currentPage < state.pages.length
  ) {
    selectedPageIdx = state.currentPage;
  } else {
    selectedPageIdx = 0;
  }

  try {
    history.pushState({ admin: true }, '', '#admin');
  } catch (e) {}

  renderAdminSidebar();
  renderEditor();
  updateMobilePagesButton();
}

function exitAdmin() {
  /*
   * Preserve the page-name field before closing.
   * Other editor fields already update state as they are edited.
   */
  applyPageName();

  adminMode = false;

  document.getElementById('admin-panel').style.display = 'none';

  closeMobileSidebar();

  renderViewer();
}

document.getElementById('exit-admin-btn').addEventListener('click', function() {
  /*
   * Close the Admin directly.
   * Do not depend on browser history for an important UI button.
   */
  exitAdmin();

  try {
    history.replaceState(
      { storyPage: state.currentPage },
      '',
      '#p' + (state.currentPage + 1)
    );
  } catch (e) {}
});

document.getElementById('save-btn').addEventListener('click', function() {
  applyPageName();

  saveState().then(function() {
    renderViewer();
  });
});


// ============================================================
// MOBILE SIDEBAR
// ============================================================

function isMobileAdminLayout() {
  return !!(
    window.matchMedia &&
    window.matchMedia('(max-width:700px)').matches
  );
}

function updateMobilePagesButton() {
  var btn = document.getElementById('mobile-pages-btn');

  if (!btn) return;

  if (isMobileAdminLayout()) {
    btn.style.display = 'inline-flex';
  } else {
    btn.style.display = 'none';
    closeMobileSidebar();
  }
}

function openMobileSidebar() {
  var sidebar = document.getElementById('pages-sidebar');
  var scrim = document.getElementById('sidebar-scrim');
  var btn = document.getElementById('mobile-pages-btn');

  if (!sidebar || !scrim) return;

  sidebar.classList.add('open');
  scrim.classList.add('open');

  sidebar.setAttribute('aria-hidden', 'false');

  if (btn) {
    btn.setAttribute('aria-expanded', 'true');
  }
}

function closeMobileSidebar() {
  var sidebar = document.getElementById('pages-sidebar');
  var scrim = document.getElementById('sidebar-scrim');
  var btn = document.getElementById('mobile-pages-btn');

  if (sidebar) {
    sidebar.classList.remove('open');

    if (isMobileAdminLayout()) {
      sidebar.setAttribute('aria-hidden', 'true');
    } else {
      sidebar.setAttribute('aria-hidden', 'false');
    }
  }

  if (scrim) {
    scrim.classList.remove('open');
  }

  if (btn) {
    btn.setAttribute('aria-expanded', 'false');
  }
}

var mobilePagesBtn = document.getElementById('mobile-pages-btn');

if (mobilePagesBtn) {
  mobilePagesBtn.setAttribute('aria-expanded', 'false');

  mobilePagesBtn.addEventListener('click', function(ev) {
    ev.preventDefault();
    ev.stopPropagation();

    var sb = document.getElementById('pages-sidebar');

    if (!sb) return;

    if (sb.classList.contains('open')) {
      closeMobileSidebar();
    } else {
      openMobileSidebar();
    }
  });
}

var sidebarScrim = document.getElementById('sidebar-scrim');

if (sidebarScrim) {
  sidebarScrim.addEventListener('click', function(ev) {
    ev.preventDefault();
    closeMobileSidebar();
  });
}

updateMobilePagesButton();

window.addEventListener('resize', updateMobilePagesButton);


// ============================================================
// ADMIN SIDEBAR / PAGE SELECTION
// ============================================================

function selectAdminPage(idx) {
  if (idx < 0 || idx >= state.pages.length) return;

  // Preserve current page name before switching editor pages.
  applyPageName();

  selectedPageIdx = idx;

  renderAdminSidebar();
  renderEditor();

  // On phones the drawer should close after choosing a page.
  if (isMobileAdminLayout()) {
    closeMobileSidebar();
  }
}

function renderAdminSidebar() {
  var list = document.getElementById('pages-list');

  if (!list) return;

  list.innerHTML = '';

  state.pages.forEach(function(p, i) {
    /*
     * Use a real BUTTON instead of a clickable DIV.
     * This gives reliable tap/click semantics on iOS/Android and
     * improves keyboard/accessibility behavior.
     */
    var el = document.createElement('button');

    el.type = 'button';

    el.className =
      'page-thumb' +
      (i === selectedPageIdx ? ' selected' : '');

    el.setAttribute(
      'aria-label',
      'ערוך ' + (p.name || ('עמוד ' + (i + 1)))
    );

    el.innerHTML =
      '<span class="pg-num">' +
        (i + 1) +
      '</span>' +

      '<span class="pg-name">' +
        escHtml(p.name) +
      '</span>' +

      (
        p.locked
          ? '<span class="pg-lock">🔒</span>'
          : ''
      );

    (function(idx) {
      el.addEventListener('click', function(ev) {
        ev.preventDefault();
        ev.stopPropagation();

        selectAdminPage(idx);
      });
    })(i);

    list.appendChild(el);
  });
}


// ============================================================
// ADD / DELETE PAGE
// ============================================================

document.getElementById('add-page-btn').addEventListener('click', function(ev) {
  ev.preventDefault();

  applyPageName();

  var p = {
    id: uid(),
    name: 'עמוד ' + (state.pages.length + 1),
    locked: false,
    background: ensureBackground({}),
    elements: []
  };

  state.pages.push(p);

  selectedPageIdx = state.pages.length - 1;

  renderAdminSidebar();
  renderEditor();

  if (isMobileAdminLayout()) {
    closeMobileSidebar();
  }
});

document.getElementById('del-page-btn').addEventListener('click', function(ev) {
  ev.preventDefault();

  if (state.pages.length <= 1) {
    notify('לא ניתן למחוק את הדף האחרון');
    return;
  }

  if (!confirm('למחוק את הדף?')) return;

  state.pages.splice(selectedPageIdx, 1);

  selectedPageIdx =
    Math.max(0, selectedPageIdx - 1);

  if (state.currentPage >= state.pages.length) {
    state.currentPage =
      state.pages.length - 1;
  }

  renderAdminSidebar();
  renderEditor();
});
