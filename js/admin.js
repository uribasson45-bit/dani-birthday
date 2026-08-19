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

// ============================================================
// TEMPORARY MEDIA MIGRATION SCAN BUTTON
// ============================================================

function ensureMediaMigrationScanButton() {
  if (
    document.getElementById(
      'media-migration-scan-btn'
    )
  ) {
    return;
  }

  var saveBtn =
    document.getElementById(
      'save-btn'
    );

  if (!saveBtn) return;

  var btn =
    document.createElement(
      'button'
    );

  btn.type =
    'button';

  btn.id =
    'media-migration-scan-btn';

  btn.className =
    saveBtn.className || 'btn-sm';

  btn.textContent =
    '☁️ בדוק מדיה מקומית';

  btn.style.marginInlineStart =
    '8px';

  saveBtn.parentNode.insertBefore(
    btn,
    saveBtn.nextSibling
  );


  btn.addEventListener(
    'click',
    async function(ev) {

      ev.preventDefault();

      if (
        typeof scanLocalMediaForMigration !==
        'function'
      ) {
        alert(
          'פונקציית בדיקת המדיה לא נמצאה'
        );

        return;
      }


      btn.disabled =
        true;

      var oldText =
        btn.textContent;

      btn.textContent =
        '⏳ בודק...';


      try {

        var results =
          await scanLocalMediaForMigration();


        if (!results) {
          return;
        }


        var total =
          results.length;


        var existing =
          results.filter(
            function(item) {
              return item.exists;
            }
          );


        var missing =
          results.filter(
            function(item) {
              return !item.exists;
            }
          );


        var images =
          existing.filter(
            function(item) {

              return (
                item.type === 'image' ||
                item.type === 'background'
              );
            }
          );


        var audio =
          existing.filter(
            function(item) {

              return (
                item.type === 'audio'
              );
            }
          );


        var largest =
          null;


        existing.forEach(
          function(item) {

            if (
              !largest ||
              item.size >
              largest.size
            ) {
              largest =
                item;
            }
          }
        );


        var message =

          'בדיקת המדיה הסתיימה ✅\n\n' +

          'סה"כ הפניות למדיה: ' +
          total +
          '\n' +

          'נמצאו במכשיר: ' +
          existing.length +
          '\n' +

          'חסרים במכשיר: ' +
          missing.length +
          '\n\n' +

          'תמונות / רקעים: ' +
          images.length +
          '\n' +

          'קטעי אודיו: ' +
          audio.length +
          '\n';


        if (largest) {

          message +=

            '\nהקובץ הגדול ביותר: ' +
            largest.sizeMB +
            'MB';


          if (largest.fileName) {

            message +=
              '\nשם: ' +
              largest.fileName;
          }


          message +=
            '\nמיקום: ' +
            largest.location;
        }


        if (
          missing.length > 0
        ) {

          message +=
            '\n\n⚠️ קבצים חסרים:';


          missing.slice(
            0,
            10
          ).forEach(
            function(item) {

              message +=
                '\n- ' +
                item.location +
                ' (' +
                item.mediaId +
                ')';
            }
          );


          if (
            missing.length > 10
          ) {

            message +=
              '\n... ועוד ' +
              (
                missing.length -
                10
              );
          }
        }


        alert(
          message
        );


        console.log(
          'MEDIA MIGRATION SCAN RESULTS:',
          results
        );

      } catch (error) {

        console.error(
          'Media migration scan failed:',
          error
        );

        alert(
          'שגיאה בבדיקת המדיה המקומית'
        );

      } finally {

        btn.disabled =
          false;

        btn.textContent =
          oldText;
      }
    }
  );
}


// Create the button when admin.js loads.
ensureMediaMigrationScanButton();

// ============================================================
// MEDIA MIGRATION UPLOAD BUTTON
// ============================================================

function ensureMediaMigrationUploadButton() {
  if (
    document.getElementById(
      'media-migration-upload-btn'
    )
  ) {
    return;
  }


  var scanBtn =
    document.getElementById(
      'media-migration-scan-btn'
    );

  var saveBtn =
    document.getElementById(
      'save-btn'
    );


  if (!saveBtn) return;


  var btn =
    document.createElement(
      'button'
    );


  btn.type =
    'button';


  btn.id =
    'media-migration-upload-btn';


  btn.className =
    saveBtn.className ||
    'btn-sm';


  btn.textContent =
    '☁️ העבר מדיה לענן';


  btn.style.marginInlineStart =
    '8px';


  /*
   * Put it after the scan button if the scan button exists.
   * Otherwise place it after Save.
   */
  if (
    scanBtn &&
    scanBtn.parentNode
  ) {

    scanBtn.parentNode.insertBefore(
      btn,
      scanBtn.nextSibling
    );

  } else {

    saveBtn.parentNode.insertBefore(
      btn,
      saveBtn.nextSibling
    );
  }


  btn.addEventListener(
    'click',
    async function(ev) {

      ev.preventDefault();


      if (
        typeof migrateAllLocalMediaToCloud !==
        'function'
      ) {

        alert(
          'פונקציית העברת המדיה לא נמצאה'
        );

        return;
      }


      var ok =
        confirm(
          'להעביר עכשיו את כל המדיה המקומית לענן?\n\n' +
          'התהליך יכול לקחת כמה דקות.\n' +
          'נא לא לסגור את האתר בזמן ההעלאה.'
        );


      if (!ok) return;


      btn.disabled =
        true;


      if (scanBtn) {
        scanBtn.disabled =
          true;
      }


      var oldText =
        btn.textContent;


      try {

        btn.textContent =
          '⏳ מתחיל...';


        var result =
          await migrateAllLocalMediaToCloud(
            function(progress) {

              var current =
                progress.current ||
                0;

              var total =
                progress.total ||
                0;


              if (
                progress.status ===
                'reading'
              ) {

                btn.textContent =
                  '📂 קורא ' +
                  current +
                  '/' +
                  total;
              }


              else if (
                progress.status ===
                'preparing'
              ) {

                btn.textContent =
                  '🗜️ מכין ' +
                  current +
                  '/' +
                  total;
              }


              else if (
                progress.status ===
                'uploading'
              ) {

                btn.textContent =
                  '☁️ מעלה ' +
                  current +
                  '/' +
                  total;
              }


              else if (
                progress.status ===
                'done'
              ) {

                btn.textContent =
                  '✅ הועלה ' +
                  current +
                  '/' +
                  total;
              }


              else if (
                progress.status ===
                'error'
              ) {

                btn.textContent =
                  '⚠️ שגיאה ' +
                  current +
                  '/' +
                  total;
              }
            }
          );


        var message =

          'העברת המדיה הסתיימה ✅\n\n' +

          'סה"כ: ' +
          result.total +
          '\n' +

          'הועלו בהצלחה: ' +
          result.success +
          '\n' +

          'נכשלו: ' +
          result.failed;


        if (
          result.failed === 0
        ) {

          message +=
            '\n\n🎉 כל המדיה הועברה לענן בהצלחה.';

        } else {

          message +=
            '\n\n⚠️ חלק מהקבצים לא הועלו. אל תמחק שום דבר מהמכשיר עדיין.';
        }


        alert(
          message
        );


        console.log(
          'MEDIA MIGRATION RESULT:',
          result
        );


        /*
         * Refresh editor so cloud-backed
         * previews are immediately used.
         */
        renderEditor();


      } catch (error) {

        console.error(
          'Media migration failed:',
          error
        );


        alert(
          'העברת המדיה נכשלה:\n\n' +
          String(error)
        );


      } finally {

        btn.disabled =
          false;


        if (scanBtn) {
          scanBtn.disabled =
            false;
        }


        btn.textContent =
          oldText;
      }
    }
  );
}


// Create the upload button.
ensureMediaMigrationUploadButton();