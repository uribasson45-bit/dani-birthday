// ─────────────────────────────────────────────
// ADMIN LOGIN
// ─────────────────────────────────────────────

document
  .getElementById('admin-trigger')
  .addEventListener(
    'click',
    function() {

      if (adminMode) {
        exitAdmin();
        return;
      }


      var loginEl =
        document.getElementById(
          'admin-login'
        );


      loginEl.style.display =
        'flex';


      document
        .getElementById('login-pw')
        .value = '';


      document
        .getElementById('login-err')
        .textContent = '';


      setTimeout(
        function() {

          document
            .getElementById('login-pw')
            .focus();

        },
        100
      );
    }
  );


// Login button
document
  .getElementById('login-btn')
  .addEventListener(
    'click',
    doLogin
  );


// Enter key inside password input
document
  .getElementById('login-pw')
  .addEventListener(
    'keydown',
    function(ev) {

      if (ev.key === 'Enter') {
        doLogin();
      }

    }
  );


// ─────────────────────────────────────────────
// LOGIN LOGIC
// ─────────────────────────────────────────────

function doLogin() {

  var pw =
    document
      .getElementById('login-pw')
      .value;


  if (pw === ADMIN_PASSWORD) {

    document
      .getElementById('admin-login')
      .style.display = 'none';


    enterAdmin();
  }

  else {

    document
      .getElementById('login-err')
      .textContent =
        'סיסמה שגויה, נסה שוב';


    document
      .getElementById('login-pw')
      .value = '';
  }
}


// ─────────────────────────────────────────────
// ENTER ADMIN
// ─────────────────────────────────────────────

function enterAdmin() {

  adminMode = true;


  var panel =
    document.getElementById(
      'admin-panel'
    );


  panel.style.display =
    'flex';


  /*
   * Start editing the page currently being
   * viewed by the client.
   */
  selectedPageIdx =
    state.currentPage;


  renderAdminSidebar();

  renderEditor();
}


// ─────────────────────────────────────────────
// EXIT ADMIN
// ─────────────────────────────────────────────

function exitAdmin() {

  /*
   * Apply the current page-name field
   * before leaving the editor.
   */
  applyPageName();


  /*
   * If Admin just locked the page the viewer
   * was currently on, move the viewer backwards.
   */
  normalizeCurrentPage();


  adminMode = false;


  document
    .getElementById('admin-panel')
    .style.display = 'none';


  /*
   * Re-render immediately.
   *
   * The user should NOT need to refresh
   * the browser after leaving Admin.
   */
  renderViewer();
}


// ─────────────────────────────────────────────
// EXIT BUTTON
// ─────────────────────────────────────────────

document
  .getElementById('exit-admin-btn')
  .addEventListener(
    'click',
    exitAdmin
  );


// ─────────────────────────────────────────────
// SAVE BUTTON
// ─────────────────────────────────────────────

document
  .getElementById('save-btn')
  .addEventListener(
    'click',
    function() {

      // Save page name currently typed in Admin.
      applyPageName();


      // Protect viewer from locked-current-page state.
      normalizeCurrentPage();


      /*
       * Save current story state.
       *
       * IMPORTANT:
       * This is still localStorage for now.
       * Later we'll replace this with shared storage.
       */
      saveState();


      /*
       * Update the client DOM immediately even though
       * the Admin panel is currently covering it.
       */
      renderViewer();
    }
  );