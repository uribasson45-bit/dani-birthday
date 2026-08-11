// ============================================================
// ADMIN LOGIN
// ============================================================
document.getElementById('admin-trigger').addEventListener('click', function() {
  if (adminMode) { exitAdmin(); return; }
  var loginEl = document.getElementById('admin-login');
  loginEl.style.display = 'flex';
  document.getElementById('login-pw').value = '';
  document.getElementById('login-err').textContent = '';
  setTimeout(function() { document.getElementById('login-pw').focus(); }, 100);
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
    document.getElementById('login-err').textContent = 'סיסמה שגויה, נסה שוב';
    document.getElementById('login-pw').value = '';
  }
}

function enterAdmin() {
  adminMode = true;
  var panel = document.getElementById('admin-panel');
  panel.style.display = 'flex';
  selectedPageIdx = state.currentPage;
  try { history.pushState({ admin: true }, '', '#admin'); } catch(e) {}
  renderAdminSidebar();
  renderEditor();
}

function exitAdmin() {
  adminMode = false;
  document.getElementById('admin-panel').style.display = 'none';
  closeMobileSidebar();
  renderViewer();
}

document.getElementById('exit-admin-btn').addEventListener('click', function() {
  try { history.back(); } catch(e) { exitAdmin(); }
});
document.getElementById('save-btn').addEventListener('click', function() {
  applyPageName(); saveState().then(function(){ renderViewer(); });
});

// ─── MOBILE SIDEBAR TOGGLE (pages list on small screens) ───
function openMobileSidebar() {
  document.getElementById('pages-sidebar').classList.add('open');
  document.getElementById('sidebar-scrim').classList.add('open');
}
function closeMobileSidebar() {
  document.getElementById('pages-sidebar').classList.remove('open');
  document.getElementById('sidebar-scrim').classList.remove('open');
}
document.getElementById('mobile-pages-btn').addEventListener('click', function() {
  var sb = document.getElementById('pages-sidebar');
  if (sb.classList.contains('open')) closeMobileSidebar(); else openMobileSidebar();
});
document.getElementById('sidebar-scrim').addEventListener('click', closeMobileSidebar);
if (window.matchMedia && window.matchMedia('(max-width:700px)').matches) {
  document.getElementById('mobile-pages-btn').style.display = 'inline-flex';
}

// ============================================================
// ADMIN SIDEBAR
// ============================================================
function renderAdminSidebar() {
  var list = document.getElementById('pages-list');
  list.innerHTML = '';
  state.pages.forEach(function(p, i) {
    var el = document.createElement('div');
    el.className = 'page-thumb' + (i === selectedPageIdx ? ' selected' : '');
    el.innerHTML = '<span class="pg-num">' + (i + 1) + '</span><span class="pg-name">' + escHtml(p.name) + '</span>' + (p.locked ? '<span class="pg-lock">🔒</span>' : '');
    (function(idx) {
      el.addEventListener('click', function() {
        applyPageName(); selectedPageIdx = idx; renderAdminSidebar(); renderEditor(); closeMobileSidebar();
      });
    })(i);
    list.appendChild(el);
  });
}

document.getElementById('add-page-btn').addEventListener('click', function() {
  applyPageName();
  var p = { id: uid(), name: 'עמוד ' + (state.pages.length + 1), locked: false, background: ensureBackground({}), elements: [] };
  state.pages.push(p);
  selectedPageIdx = state.pages.length - 1;
  renderAdminSidebar();
  renderEditor();
});

document.getElementById('del-page-btn').addEventListener('click', function() {
  if (state.pages.length <= 1) { notify('לא ניתן למחוק את הדף האחרון'); return; }
  if (!confirm('למחוק את הדף?')) return;
  state.pages.splice(selectedPageIdx, 1);
  selectedPageIdx = Math.max(0, selectedPageIdx - 1);
  if (state.currentPage >= state.pages.length) state.currentPage = state.pages.length - 1;
  renderAdminSidebar();
  renderEditor();
});
