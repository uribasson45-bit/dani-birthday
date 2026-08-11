// ─── ADMIN SIDEBAR ───
function renderAdminSidebar() {
  var list = document.getElementById('pages-list');
  list.innerHTML = '';
  state.pages.forEach(function(p, i) {
    var el = document.createElement('div');
    el.className = 'page-thumb' + (i === selectedPageIdx ? ' selected' : '');
    el.innerHTML = '<span class="pg-num">' + (i + 1) + '</span><span class="pg-name">' + escHtml(p.name) + '</span>' + (p.locked ? '<span class="pg-lock">🔒</span>' : '');
    // FIX: use addEventListener (onclick override issues in some Chrome versions)
    (function(idx) {
      el.addEventListener('click', function() {
        applyPageName(); selectedPageIdx = idx; renderAdminSidebar(); renderEditor();
      });
    })(i);
    list.appendChild(el);
  });
}

document.getElementById('add-page-btn').addEventListener('click', function() {
  applyPageName();
  var p = { id: uid(), name: 'עמוד ' + (state.pages.length + 1), locked: false, background: { type: 'none', value: '' }, elements: [] };
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

// ─── EDITOR ───
function getPage() { return state.pages[selectedPageIdx]; }

function applyPageName() {
  var p = getPage();
  if (p) p.name = document.getElementById('page-name-input').value || p.name;
}

function renderEditor() {
  var p = getPage(); if (!p) return;
  // Ensure background exists (migration)
  if (!p.background) p.background = { type: 'none', value: '' };

  document.getElementById('page-name-input').value = p.name;
  var lockBtn = document.getElementById('toggle-lock-btn');
  lockBtn.textContent = p.locked ? '🔓 בטל נעילה' : '🔒 נעל דף';
  // FIX: correctly set the class on the button in the topbar
  lockBtn.className = 'btn-sm' + (p.locked ? ' active-lock' : '');

  var area = document.getElementById('elements-area');
  area.innerHTML = '';

  // ── Background section ──
  area.appendChild(buildBgRow(p));

  if (!p.elements.length) {
    var em = document.createElement('div');
    em.className = 'empty-state';
    em.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/></svg><p>הוסף אלמנטים לדף זה</p>';
    area.appendChild(em);
  } else {
    p.elements.forEach(function(el, i) { area.appendChild(buildElItem(el, i)); });
  }
  renderPreview();
}

// ─── PER-PAGE BACKGROUND ROW ───
function buildBgRow(p) {
  var bg  = p.background;
  var row = document.createElement('div');
  row.className = 'bg-row';

  row.innerHTML =
    '<label>🎨 רקע הדף</label>' +
    '<div class="bg-options">' +
      '<button class="bg-type-btn' + (bg.type==='none'?' active':'') + '" data-bgtype="none">ללא</button>' +
      '<button class="bg-type-btn' + (bg.type==='color'?' active':'') + '" data-bgtype="color">צבע</button>' +
      '<button class="bg-type-btn' + (bg.type==='image'?' active':'') + '" data-bgtype="image">תמונה</button>' +
      (bg.type==='color' ? '<input type="color" class="bg-color-input" id="bg-color-pick" value="' + escHtml(bg.value||'#0D1124') + '">' : '') +
      (bg.type==='image' ? '<label class="bg-upload-btn">📷 העלה תמונה<input type="file" id="bg-img-upload" accept="image/*"></label>' : '') +
      (bg.type!=='none'  ? '<button class="bg-clear" id="bg-clear-btn">✕ נקה</button>' : '') +
      (bg.type==='color' ? '<div class="bg-preview-swatch" style="background:' + escHtml(bg.value||'#0D1124') + '"></div>' : '') +
      (bg.type==='image' && bg.value ? '<span style="font-size:11px;color:#7EC897">✓ תמונת רקע</span>' : '') +
    '</div>';

  // Type buttons — FIX: addEventListener
  row.querySelectorAll('[data-bgtype]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      p.background.type  = btn.dataset.bgtype;
      if (btn.dataset.bgtype === 'none') p.background.value = '';
      renderEditor();
      renderPreview();
    });
  });

  // Color picker
  var colorPick = row.querySelector('#bg-color-pick');
  if (colorPick) {
    colorPick.addEventListener('input', function() {
      p.background.value = colorPick.value;
      var swatch = row.querySelector('.bg-preview-swatch');
      if (swatch) swatch.style.background = colorPick.value;
      renderPreview();
    });
    colorPick.addEventListener('change', function() {
      p.background.value = colorPick.value;
      var swatch = row.querySelector('.bg-preview-swatch');
      if (swatch) swatch.style.background = colorPick.value;
      renderPreview();
    });
  }

  // Image upload
  var imgUp = row.querySelector('#bg-img-upload');
  if (imgUp) {
    imgUp.addEventListener('change', function() {
      var file = imgUp.files[0]; if (!file) return;
      if (file.size > 5 * 1024 * 1024) { notify('תמונת רקע גדולה מדי (מקסימום 5MB)'); return; }
      notify('טוען רקע...');
      var reader = new FileReader();
      reader.onload = function(ev) {
        p.background.value = ev.target.result;
        renderEditor();
        renderPreview();
        notify('רקע הוגדר! ✓');
      };
      reader.readAsDataURL(file);
    });
  }

  // Clear
  var clearBtn = row.querySelector('#bg-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      p.background = { type: 'none', value: '' };
      renderEditor();
      renderPreview();
    });
  }

  return row;
}

// FIX: toggle-lock-btn with addEventListener
document.getElementById('toggle-lock-btn').addEventListener('click', function() {
  var p = getPage(); if (!p) return;
  p.locked = !p.locked;
  renderEditor();
  renderAdminSidebar();
});

// ─── ADD ELEMENT BUTTONS ───
var addBtns = {
  'add-heading':    function() { addEl({ id: uid(), type: 'heading',    value: 'כותרת ראשית' }); },
  'add-subheading': function() { addEl({ id: uid(), type: 'subheading', value: 'כותרת משנה' }); },
  'add-text':       function() { addEl({ id: uid(), type: 'text',       value: 'טקסט כאן...' }); },
  'add-image':      function() { addEl({ id: uid(), type: 'image',      src: '', alt: '', size: 'medium' }); },
  'add-audio':      function() { addEl({ id: uid(), type: 'audio',      src: '', label: 'מוזיקה', autoplay: false }); },
  'add-video':      function() { addEl({ id: uid(), type: 'video',      src: '', label: '', autoplay: false }); }
};
Object.keys(addBtns).forEach(function(id) {
  var btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener('click', function() {
      addBtns[id]();
      renderEditor();
    });
  }
});
function addEl(el) { var p = getPage(); if (!p) return; p.elements.push(el); }

// ─── BUILD ELEMENT EDITOR ITEM ───
function buildElItem(el, idx) {
  var wrap = document.createElement('div');
  wrap.className = 'el-item';
  var typeNames = { heading: 'כותרת', subheading: 'כותרת משנה', text: 'טקסט', subtitle: 'תת-כותרת', image: 'תמונה', audio: 'אודיו', video: 'וידאו / YouTube' };
  var typeName  = typeNames[el.type] || el.type;
  var inner = '';

  if (['heading', 'subheading', 'text', 'subtitle'].indexOf(el.type) !== -1) {
    var isTA = el.type === 'text';
    inner = '<div class="el-row"><label>תוכן</label>' + (isTA
      ? '<textarea data-field="value" data-id="' + el.id + '">' + escHtml(el.value) + '</textarea>'
      : '<input type="text" data-field="value" data-id="' + el.id + '" value="' + escHtml(el.value) + '">'
    ) + '</div>';
  }
  else if (el.type === 'image') {
    var previewHtml = el.src ? '<img class="img-preview" src="' + el.src + '" alt="">' : '';
    var fileName    = el.fileName ? '<div class="upload-status ok">✓ ' + escHtml(el.fileName) + '</div>' : '';
    var sizeVal     = el.size || 'medium';
    inner =
      '<div class="el-row">' +
        '<label>העלאת תמונה מהמכשיר</label>' +
        '<label class="upload-btn">📁 בחר תמונה<input type="file" accept="image/*" data-upload="image" data-id="' + el.id + '"></label>' +
        fileName + previewHtml +
      '</div>' +
      '<div class="el-row">' +
        '<label>או הכנס URL (אופציונלי)</label>' +
        '<input type="text" data-field="src" data-id="' + el.id + '" value="' + escHtml(el.src||'') + '" placeholder="https://...">' +
      '</div>' +
      '<div class="el-row">' +
        '<label>גודל תמונה</label>' +
        '<select class="size-select" data-field="size" data-id="' + el.id + '">' +
          '<option value="small"'  + (sizeVal==='small'?' selected':'')  + '>קטן</option>' +
          '<option value="medium"' + (sizeVal==='medium'?' selected':'') + '>בינוני (ברירת מחדל)</option>' +
          '<option value="large"'  + (sizeVal==='large'?' selected':'')  + '>גדול</option>' +
          '<option value="full"'   + (sizeVal==='full'?' selected':'')   + '>מלא</option>' +
        '</select>' +
      '</div>' +
      '<div class="el-row">' +
        '<label>תיאור נגישות</label>' +
        '<input type="text" data-field="alt" data-id="' + el.id + '" value="' + escHtml(el.alt||'') + '">' +
      '</div>';
  }
  else if (el.type === 'audio') {
    var fileName2 = el.fileName ? '<div class="upload-status ok">✓ ' + escHtml(el.fileName) + '</div>' : '';
    inner =
      '<div class="row2">' +
        '<div class="el-row"><label>כותרת</label><input type="text" data-field="label" data-id="' + el.id + '" value="' + escHtml(el.label||'') + '"></div>' +
        '<div class="el-row"><label>הפעלה אוטומטית</label>' +
          '<select data-field="autoplay" data-id="' + el.id + '">' +
            '<option value="false"' + (!el.autoplay?' selected':'') + '>לא</option>' +
            '<option value="true"'  + (el.autoplay?' selected':'')  + '>כן</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="el-row">' +
        '<label>העלאת קובץ אודיו (MP3, M4A, WAV)</label>' +
        '<label class="upload-btn">🎵 בחר קובץ אודיו<input type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg" data-upload="audio" data-id="' + el.id + '"></label>' +
        fileName2 +
      '</div>' +
      '<div class="el-row">' +
        '<label>או הכנס URL (אופציונלי)</label>' +
        '<input type="text" data-field="src" data-id="' + el.id + '" value="' + escHtml(el.src||'') + '" placeholder="https://...mp3">' +
      '</div>';
  }
  else if (el.type === 'video') {
    var fileName3 = el.fileName ? '<div class="upload-status ok">✓ ' + escHtml(el.fileName) + '</div>' : '';
    var isYT      = isYouTubeUrl(el.src || '');
    inner =
      '<div class="row2">' +
        '<div class="el-row"><label>כותרת (אופציונלי)</label><input type="text" data-field="label" data-id="' + el.id + '" value="' + escHtml(el.label||'') + '"></div>' +
        '<div class="el-row"><label>הפעלה אוטומטית</label>' +
          '<select data-field="autoplay" data-id="' + el.id + '">' +
            '<option value="false"' + (!el.autoplay?' selected':'') + '>לא</option>' +
            '<option value="true"'  + (el.autoplay?' selected':'')  + '>כן (ללא קול)</option>' +
          '</select>' +
        '</div>' +
      '</div>' +
      '<div class="el-row">' +
        '<label>🎬 קישור YouTube או URL לוידאו MP4</label>' +
        '<input type="text" data-field="src" data-id="' + el.id + '" value="' + escHtml(el.src||'') + '" placeholder="https://youtube.com/watch?v=... או https://...mp4">' +
        (isYT ? '<div class="upload-status ok">✓ קישור YouTube זוהה</div>' : '') +
      '</div>' +
      '<div class="el-row">' +
        '<label>או העלאת קובץ MP4 מהמכשיר</label>' +
        '<label class="upload-btn">📁 בחר קובץ וידאו<input type="file" accept="video/*,.mp4,.mov,.webm,.m4v" data-upload="video" data-id="' + el.id + '"></label>' +
        fileName3 +
      '</div>' +
      '<div class="upload-status" style="color:var(--text-muted);font-size:11px">💡 מומלץ: השתמש בקישור YouTube לחוויה הטובה ביותר בכל המכשירים</div>';
  }

  wrap.innerHTML =
    '<div class="el-item-header">' +
      '<span class="el-type-badge">' + typeName + '</span>' +
      '<div class="el-item-actions">' +
        (idx > 0 ? '<button class="el-action-btn" data-action="up" data-idx="' + idx + '">▲</button>' : '') +
        (idx < (getPage().elements.length - 1) ? '<button class="el-action-btn" data-action="down" data-idx="' + idx + '">▼</button>' : '') +
        '<button class="el-action-btn del" data-action="del" data-idx="' + idx + '">✕</button>' +
      '</div>' +
    '</div>' + inner;

  // Field change events — FIX: addEventListener
  wrap.querySelectorAll('[data-field]').forEach(function(inp) {
    var field = inp.dataset.field;
    var elId  = inp.dataset.id;
    var update = function() {
      var target = getPage().elements.find(function(e) { return e.id === elId; });
      if (!target) return;
      var val = inp.value;
      if (field === 'autoplay') val = (val === 'true');
      target[field] = val;
      renderPreview();
    };
    inp.addEventListener('input', update);
    if (inp.tagName === 'SELECT') inp.addEventListener('change', update);
  });

  // File upload events — FIX: addEventListener
  wrap.querySelectorAll('[data-upload]').forEach(function(fileInput) {
    fileInput.addEventListener('change', function() {
      var file       = fileInput.files[0]; if (!file) return;
      var elId       = fileInput.dataset.id;
      var uploadType = fileInput.dataset.upload;
      var target     = getPage().elements.find(function(e) { return e.id === elId; }); if (!target) return;
      var limits     = { image: 8, audio: 15, video: 80 };
      var maxMB      = limits[uploadType] || 10;
      if (file.size > maxMB * 1024 * 1024) { notify('הקובץ גדול מדי (מקסימום ' + maxMB + 'MB)'); return; }
      notify('טוען קובץ...');
      var reader = new FileReader();
      reader.onload = function(ev) {
        target.src      = ev.target.result;
        target.fileName = file.name;
        renderEditor();
        notify('הקובץ הועלה! ✓');
      };
      reader.onerror = function() { notify('שגיאה בטעינת הקובץ'); };
      reader.readAsDataURL(file);
    });
  });

  // Move / delete — FIX: addEventListener
  wrap.querySelectorAll('[data-action]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var action = btn.dataset.action;
      var i      = parseInt(btn.dataset.idx, 10);
      var els    = getPage().elements;
      var tmp;
      if (action === 'del') {
        els.splice(i, 1);
        renderEditor();
      } else if (action === 'up' && i > 0) {
        tmp = els[i-1]; els[i-1] = els[i]; els[i] = tmp;
        renderEditor();
      } else if (action === 'down' && i < els.length-1) {
        tmp = els[i]; els[i] = els[i+1]; els[i+1] = tmp;
        renderEditor();
      }
    });
  });

  return wrap;
}

function renderPreview() {
  var pane = document.getElementById('preview-inner');
  var p    = getPage();
  pane.innerHTML = '';
  if (!p) return;
  p.elements.forEach(function(e) {
    var el = buildViewElement(e);
    el.style.cssText = 'transform:scale(0.8);transform-origin:top center;margin-bottom:-16px';
    pane.appendChild(el);
  });
}
