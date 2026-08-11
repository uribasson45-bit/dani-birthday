// ============================================================
// EDITOR
// ============================================================
function getPage() { return state.pages[selectedPageIdx]; }

function applyPageName() {
  var p = getPage();
  var input = document.getElementById('page-name-input');
  if (p && input) p.name = input.value || p.name;
}

function renderEditor() {
  var p = getPage(); if (!p) return;
  ensureBackground(p);

  document.getElementById('page-name-input').value = p.name;
  var lockBtn = document.getElementById('toggle-lock-btn');
  lockBtn.textContent = p.locked ? '🔓 בטל נעילה' : '🔒 נעל דף';
  lockBtn.className = 'btn-sm' + (p.locked ? ' active-lock' : '');

  var area = document.getElementById('elements-area');
  area.innerHTML = '';

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

// ============================================================
// PER-PAGE BACKGROUND ROW (color / gradient / image + overlay)
// ============================================================
function buildBgRow(p) {
  var bg  = ensureBackground(p);
  var row = document.createElement('div');
  row.className = 'bg-row';

  var typeButtons =
    '<button class="bg-type-btn' + (bg.type==='none'?' active':'') + '" data-bgtype="none">ללא</button>' +
    '<button class="bg-type-btn' + (bg.type==='color'?' active':'') + '" data-bgtype="color">צבע</button>' +
    '<button class="bg-type-btn' + (bg.type==='gradient'?' active':'') + '" data-bgtype="gradient">גרדיאנט</button>' +
    '<button class="bg-type-btn' + (bg.type==='image'?' active':'') + '" data-bgtype="image">תמונה</button>';

  var typeExtras = '';
  if (bg.type === 'color') {
    typeExtras = '<input type="color" class="bg-color-input" id="bg-color-pick" value="' + escHtml(bg.value||'#0D1124') + '">' +
      '<button class="bg-clear" id="bg-clear-btn">✕ נקה</button>';
  } else if (bg.type === 'gradient') {
    typeExtras =
      '<input type="color" class="bg-color-input" id="bg-grad1" value="' + escHtml(bg.value||'#1A1F3A') + '">' +
      '<input type="color" class="bg-color-input" id="bg-grad2" value="' + escHtml(bg.value2||'#C97B84') + '">' +
      '<button class="bg-clear" id="bg-clear-btn">✕ נקה</button>';
  } else if (bg.type === 'image') {
    typeExtras =
      '<label class="bg-upload-btn">📷 העלה תמונה<input type="file" id="bg-img-upload" accept="image/*"></label>' +
      '<button class="bg-clear" id="bg-clear-btn">✕ נקה</button>' +
      ((bg.mediaId || bg.value) ? '<span style="font-size:11px;color:#7EC897">✓ תמונת רקע הוגדרה</span>' : '');
  }

  row.innerHTML =
    '<label>🎨 רקע הדף</label>' +
    '<div class="bg-options">' + typeButtons + typeExtras + '</div>' +
    (bg.type === 'gradient' ? '<div class="bg-sub"><div class="range-row"><label style="min-width:70px;font-size:11px;color:var(--text-muted)">זווית</label><input type="range" id="bg-grad-angle" min="0" max="360" value="' + (bg.angle||135) + '"><span class="range-val" id="bg-grad-angle-val">' + (bg.angle||135) + '°</span></div></div>' : '') +
    (bg.type === 'image' ? '<div class="bg-sub row2"><div class="el-row"><label>מיקום</label><select class="size-select" id="bg-pos"><option value="center"' + (bg.position==='center'?' selected':'') + '>מרכז</option><option value="top"' + (bg.position==='top'?' selected':'') + '>למעלה</option><option value="bottom"' + (bg.position==='bottom'?' selected':'') + '>למטה</option></select></div><div class="el-row"><label>התאמה</label><select class="size-select" id="bg-fit"><option value="cover"' + (bg.fit==='cover'?' selected':'') + '>מילוי (cover)</option><option value="contain"' + (bg.fit==='contain'?' selected':'') + '>הכלה (contain)</option></select></div></div>' : '') +
    '<div class="bg-sub"><label style="display:block;margin-bottom:6px">שכבת כיסוי (Overlay)</label><div class="color-row"><input type="color" class="bg-color-input" id="bg-overlay-color" value="' + escHtml(bg.overlayColor||'#000000') + '"><input type="range" id="bg-overlay-opacity" min="0" max="90" value="' + (bg.overlayOpacity||0) + '" style="flex:1"><span class="range-val" id="bg-overlay-val">' + (bg.overlayOpacity||0) + '%</span></div></div>';

  row.querySelectorAll('[data-bgtype]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      bg.type = btn.dataset.bgtype;
      renderEditor();
      renderPreview();
    });
  });

  var c1 = row.querySelector('#bg-color-pick');
  if (c1) c1.addEventListener('input', function() { bg.value = c1.value; renderPreview(); });

  var g1 = row.querySelector('#bg-grad1'), g2 = row.querySelector('#bg-grad2');
  if (g1) g1.addEventListener('input', function() { bg.value = g1.value; renderPreview(); });
  if (g2) g2.addEventListener('input', function() { bg.value2 = g2.value; renderPreview(); });
  var ga = row.querySelector('#bg-grad-angle');
  if (ga) ga.addEventListener('input', function() {
    bg.angle = Number(ga.value);
    row.querySelector('#bg-grad-angle-val').textContent = bg.angle + '°';
    renderPreview();
  });

  var posSel = row.querySelector('#bg-pos');
  if (posSel) posSel.addEventListener('change', function() { bg.position = posSel.value; renderPreview(); });
  var fitSel = row.querySelector('#bg-fit');
  if (fitSel) fitSel.addEventListener('change', function() { bg.fit = fitSel.value; renderPreview(); });

  var ov = row.querySelector('#bg-overlay-opacity');
  if (ov) ov.addEventListener('input', function() {
    bg.overlayOpacity = Number(ov.value);
    row.querySelector('#bg-overlay-val').textContent = bg.overlayOpacity + '%';
    renderPreview();
  });
  var ovc = row.querySelector('#bg-overlay-color');
  if (ovc) ovc.addEventListener('input', function() { bg.overlayColor = ovc.value; renderPreview(); });

  var imgUp = row.querySelector('#bg-img-upload');
  if (imgUp) {
    imgUp.addEventListener('change', function() {
      var file = imgUp.files[0]; if (!file) return;
      if (file.size > 8 * 1024 * 1024) { notify('תמונת רקע גדולה מדי (מקסימום 8MB)'); return; }
      notify('טוען רקע...');
      putMediaBlob(file).then(function(id) {
        bg.mediaId = id; bg.value = '';
        renderEditor(); renderPreview();
        notify('רקע הוגדר! ✓');
      }).catch(function() { notify('שגיאה בטעינת הרקע'); });
    });
  }

  var clearBtn = row.querySelector('#bg-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      bg.type = 'none'; bg.value = ''; bg.value2 = ''; bg.mediaId = '';
      renderEditor(); renderPreview();
    });
  }

  return row;
}

document.getElementById('toggle-lock-btn').addEventListener('click', function() {
  var p = getPage(); if (!p) return;
  p.locked = !p.locked;
  renderEditor();
  renderAdminSidebar();
});

// ============================================================
// ADD ELEMENT BUTTONS
// ============================================================
var addBtns = {
  'add-heading':    function() { addEl({ id: uid(), type: 'heading',    value: 'כותרת ראשית', style: defaultStyle() }); },
  'add-subheading': function() { addEl({ id: uid(), type: 'subheading', value: 'כותרת משנה', style: defaultStyle() }); },
  'add-text':       function() { addEl({ id: uid(), type: 'text',       value: 'טקסט כאן...', style: defaultStyle() }); },
  'add-image':      function() { addEl({ id: uid(), type: 'image',      src: '', mediaId: '', alt: '', size: 'medium', style: defaultStyle() }); },
  'add-audio':      function() { addEl({ id: uid(), type: 'audio',      src: '', mediaId: '', label: 'מוזיקה', autoplay: false, volume: 100, style: defaultStyle() }); },
  'add-video':      function() { addEl({ id: uid(), type: 'video',      src: '', mediaId: '', label: '', autoplay: false, style: defaultStyle() }); }
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

// ============================================================
// DRAG-TO-REORDER (pointer events -> works for mouse AND touch)
// ============================================================
var _dragState = null;
function initDragHandle(handle, idx) {
  handle.addEventListener('pointerdown', function(ev) {
    ev.preventDefault();
    var itemEl = handle.closest('.el-item');
    var area   = document.getElementById('elements-area');
    var items  = Array.prototype.slice.call(area.querySelectorAll('.el-item'));
    _dragState = { fromIdx: idx, itemEl: itemEl, items: items, startY: ev.clientY };
    itemEl.classList.add('dragging');
    try { handle.setPointerCapture(ev.pointerId); } catch(e) {}
  });
  handle.addEventListener('pointermove', function(ev) {
    if (!_dragState || _dragState.itemEl !== handle.closest('.el-item')) return;
    var items = _dragState.items;
    var y = ev.clientY;
    for (var i = 0; i < items.length; i++) {
      var r = items[i].getBoundingClientRect();
      if (y > r.top && y < r.bottom && items[i] !== _dragState.itemEl) {
        var area = document.getElementById('elements-area');
        if (y < r.top + r.height/2) area.insertBefore(_dragState.itemEl, items[i]);
        else area.insertBefore(_dragState.itemEl, items[i].nextSibling);
        break;
      }
    }
  });
  handle.addEventListener('pointerup', finishDrag);
  handle.addEventListener('pointercancel', finishDrag);
}
function finishDrag() {
  if (!_dragState) return;
  var area = document.getElementById('elements-area');
  var newOrderIds = Array.prototype.slice.call(area.querySelectorAll('.el-item')).map(function(it) { return it.dataset.elId; });
  var p = getPage();
  if (p) {
    var byId = {}; p.elements.forEach(function(e) { byId[e.id] = e; });
    p.elements = newOrderIds.map(function(id) { return byId[id]; }).filter(Boolean);
  }
  _dragState.itemEl.classList.remove('dragging');
  _dragState = null;
  renderEditor();
}

// ============================================================
// BUILD ELEMENT EDITOR ITEM (+ design panel)
// ============================================================
function buildElItem(el, idx) {
  var wrap = document.createElement('div');
  wrap.className = 'el-item';
  wrap.dataset.elId = el.id;
  var st = ensureStyle(el);
  var typeNames = { heading: 'כותרת', subheading: 'כותרת משנה', text: 'טקסט', subtitle: 'תת-כותרת', image: 'תמונה', audio: 'אודיו', video: 'וידאו / YouTube' };
  var typeName  = typeNames[el.type] || el.type;
  var isTextual = ['heading','subheading','text','subtitle'].indexOf(el.type) !== -1;
  var inner = '';

  if (isTextual) {
    var isTA = el.type === 'text';
    inner = '<div class="el-row"><label>תוכן</label>' + (isTA
      ? '<textarea data-field="value" data-id="' + el.id + '">' + escHtml(el.value) + '</textarea>'
      : '<input type="text" data-field="value" data-id="' + el.id + '" value="' + escHtml(el.value) + '">'
    ) + '</div>';
  }
  else if (el.type === 'image') {
    var fileName    = el.fileName ? '<div class="upload-status ok">✓ ' + escHtml(el.fileName) + '</div>' : '';
    var sizeVal     = el.size || 'medium';
    inner =
      '<div class="el-row">' +
        '<label>העלאת תמונה מהמכשיר</label>' +
        '<label class="upload-btn">📁 בחר תמונה<input type="file" accept="image/*" data-upload="image" data-id="' + el.id + '"></label>' +
        fileName + '<img class="img-preview" data-preview-for="' + el.id + '" style="display:none">' +
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
      '<span class="el-drag-handle" title="גרור לשינוי סדר">⠿</span>' +
      '<span class="el-type-badge">' + typeName + '</span>' +
      '<div class="el-item-actions">' +
        '<button class="el-action-btn design-toggle" data-action="design" data-idx="' + idx + '">🎨 עיצוב</button>' +
        (idx > 0 ? '<button class="el-action-btn" data-action="up" data-idx="' + idx + '">▲</button>' : '') +
        (idx < (getPage().elements.length - 1) ? '<button class="el-action-btn" data-action="down" data-idx="' + idx + '">▼</button>' : '') +
        '<button class="el-action-btn del" data-action="del" data-idx="' + idx + '">✕</button>' +
      '</div>' +
    '</div>' + inner + buildDesignPanel(el, st, isTextual);

  // load async image preview if present
  var previewImg = wrap.querySelector('[data-preview-for="' + el.id + '"]');
  if (previewImg) {
    if (el.mediaId) resolveMediaUrl(el.mediaId).then(function(url){ if(url){previewImg.src=url; previewImg.style.display='block';} });
    else if (el.src) { previewImg.src = el.src; previewImg.style.display = 'block'; }
  }

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

  wrap.querySelectorAll('[data-upload]').forEach(function(fileInput) {
    fileInput.addEventListener('change', function() {
      var file       = fileInput.files[0]; if (!file) return;
      var elId       = fileInput.dataset.id;
      var uploadType = fileInput.dataset.upload;
      var target     = getPage().elements.find(function(e) { return e.id === elId; }); if (!target) return;
      var limits     = { image: 8, audio: 20, video: 80 };
      var maxMB      = limits[uploadType] || 10;
      if (file.size > maxMB * 1024 * 1024) { notify('הקובץ גדול מדי (מקסימום ' + maxMB + 'MB)'); return; }
      notify('טוען קובץ...');
      putMediaBlob(file).then(function(id) {
        target.mediaId = id;
        target.src = '';
        target.fileName = file.name;
        renderEditor();
        notify('הקובץ הועלה! ✓');
      }).catch(function(err) {
        console.warn(err);
        notify('שגיאה בטעינת הקובץ');
      });
    });
  });

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
      } else if (action === 'design') {
        var panel = wrap.querySelector('.design-panel');
        panel.classList.toggle('open');
      }
    });
  });

  var handle = wrap.querySelector('.el-drag-handle');
  if (handle) initDragHandle(handle, idx);

  return wrap;
}

// ─── DESIGN PANEL (font, size, bold/italic, color, align, spacing,
//      line-height, background, border, radius, shadow, opacity, rotate) ───
function buildDesignPanel(el, st, isTextual) {
  var fontOptsHtml = FONT_OPTIONS.map(function(f) {
    return '<option value="' + escHtml(f.v) + '"' + (st.fontFamily===f.v?' selected':'') + '>' + f.label + '</option>';
  }).join('');

  var textSection = '';
  if (isTextual) {
    textSection =
      '<div class="design-section-title">טקסט</div>' +
      '<div class="row2">' +
        '<div class="el-row"><label>גופן</label><select class="size-select" data-st="fontFamily" data-id="' + el.id + '">' + fontOptsHtml + '</select></div>' +
        '<div class="el-row"><label>גודל גופן (px)</label><input type="number" min="8" max="120" data-st="fontSize" data-id="' + el.id + '" value="' + (st.fontSize||'') + '" placeholder="ברירת מחדל"></div>' +
      '</div>' +
      '<div class="el-row"><label>עיצוב</label><div class="toggle-row">' +
        '<button type="button" class="toggle-btn' + (st.bold?' active':'') + '" data-toggle="bold" data-id="' + el.id + '"><b>B</b></button>' +
        '<button type="button" class="toggle-btn' + (st.italic?' active':'') + '" data-toggle="italic" data-id="' + el.id + '"><i>I</i></button>' +
      '</div></div>' +
      '<div class="el-row"><label>יישור</label><div class="toggle-row">' +
        ['center','right','left','justify'].map(function(a){
          var lbl = {center:'מרכז',right:'ימין',left:'שמאל',justify:'מיושר'}[a];
          return '<button type="button" class="toggle-btn' + (st.align===a?' active':'') + '" data-align="' + a + '" data-id="' + el.id + '">' + lbl + '</button>';
        }).join('') +
      '</div></div>' +
      '<div class="el-row"><label>צבע טקסט</label><div class="color-row"><input type="color" class="bg-color-input" data-st="color" data-id="' + el.id + '" value="' + (st.color||'#F5F0E8') + '"><button type="button" class="bg-clear" data-clear="color" data-id="' + el.id + '">✕ ברירת מחדל</button></div></div>' +
      '<div class="el-row"><label>מרווח אותיות (px)</label><input type="number" step="0.5" data-st="letterSpacing" data-id="' + el.id + '" value="' + (st.letterSpacing||'') + '" placeholder="0"></div>' +
      '<div class="el-row"><label>גובה שורה</label><input type="number" step="0.1" min="0.8" max="3" data-st="lineHeight" data-id="' + el.id + '" value="' + (st.lineHeight||'') + '" placeholder="ברירת מחדל"></div>';
  }

  var boxSection =
    '<div class="design-section-title">מסגרת ורקע</div>' +
    '<div class="el-row"><label>צבע רקע לאלמנט</label><div class="color-row"><input type="color" class="bg-color-input" data-st="bg" data-id="' + el.id + '" value="' + (st.bg||'#000000') + '"><button type="button" class="bg-clear" data-clear="bg" data-id="' + el.id + '">✕ ללא</button></div></div>' +
    '<div class="row3">' +
      '<div class="el-row"><label>עובי מסגרת</label><input type="number" min="0" max="12" data-st="borderWidth" data-id="' + el.id + '" value="' + (st.borderWidth||0) + '"></div>' +
      '<div class="el-row"><label>צבע מסגרת</label><input type="color" class="bg-color-input" data-st="borderColor" data-id="' + el.id + '" value="' + (st.borderColor||'#C9A84C') + '"></div>' +
      '<div class="el-row"><label>עיגול פינות</label><input type="number" min="0" max="60" data-st="radius" data-id="' + el.id + '" value="' + (st.radius||'') + '"></div>' +
    '</div>' +
    '<div class="el-row"><label>צל</label><div class="toggle-row"><button type="button" class="toggle-btn' + (st.shadow?' active':'') + '" data-toggle="shadow" data-id="' + el.id + '">הפעל צל</button></div></div>' +
    '<div class="design-section-title">שקיפות וסיבוב</div>' +
    '<div class="el-row"><label>שקיפות</label><div class="range-row"><input type="range" min="10" max="100" data-st="opacity" data-id="' + el.id + '" value="' + (st.opacity!=null?st.opacity:100) + '"><span class="range-val" data-opacity-val="' + el.id + '">' + (st.opacity!=null?st.opacity:100) + '%</span></div></div>' +
    '<div class="el-row"><label>סיבוב (°)</label><div class="range-row"><input type="range" min="-180" max="180" data-st="rotate" data-id="' + el.id + '" value="' + (st.rotate||0) + '"><span class="range-val" data-rotate-val="' + el.id + '">' + (st.rotate||0) + '°</span></div></div>';

  var panel = '<div class="design-panel">' + textSection + boxSection + '</div>';
  return panel;
}

// Delegate design-panel input events at the elements-area level (panels are rebuilt often)
document.getElementById('elements-area').addEventListener('input', function(ev) {
  var t = ev.target;
  if (t.dataset && t.dataset.st) {
    var target = getPage().elements.find(function(e){ return e.id === t.dataset.id; });
    if (!target) return;
    var st = ensureStyle(target);
    var field = t.dataset.st;
    var val = t.value;
    if (['fontSize','letterSpacing','lineHeight','borderWidth','radius','opacity','rotate'].indexOf(field) !== -1) {
      val = val === '' ? '' : Number(val);
    }
    st[field] = val;
    if (field === 'opacity') {
      var ov = t.parentElement.querySelector('[data-opacity-val]'); if (ov) ov.textContent = val + '%';
    }
    if (field === 'rotate') {
      var rv = t.parentElement.querySelector('[data-rotate-val]'); if (rv) rv.textContent = val + '°';
    }
    renderPreview();
  }
});
document.getElementById('elements-area').addEventListener('change', function(ev) {
  var t = ev.target;
  if (t.dataset && t.dataset.st === 'fontFamily') {
    var target = getPage().elements.find(function(e){ return e.id === t.dataset.id; });
    if (target) { ensureStyle(target).fontFamily = t.value; renderPreview(); }
  }
});
document.getElementById('elements-area').addEventListener('click', function(ev) {
  var t = ev.target.closest('[data-toggle],[data-align],[data-clear]');
  if (!t) return;
  var target = getPage().elements.find(function(e){ return e.id === t.dataset.id; });
  if (!target) return;
  var st = ensureStyle(target);
  if (t.dataset.toggle) {
    st[t.dataset.toggle] = !st[t.dataset.toggle];
    t.classList.toggle('active');
  } else if (t.dataset.align) {
    st.align = (st.align === t.dataset.align) ? '' : t.dataset.align;
    t.parentElement.querySelectorAll('[data-align]').forEach(function(b){ b.classList.toggle('active', b.dataset.align === st.align); });
  } else if (t.dataset.clear) {
    st[t.dataset.clear] = '';
    var input = t.parentElement.querySelector('input[data-st="' + t.dataset.clear + '"]');
    if (input) input.value = t.dataset.clear === 'bg' ? '#000000' : '#F5F0E8';
  }
  renderPreview();
});

function renderPreview() {
  var pane = document.getElementById('preview-inner');
  var p    = getPage();
  pane.innerHTML = '';
  if (!p) return;
  p.elements.forEach(function(e) {
    var el = buildViewElement(e);
    el.style.cssText += ';transform:scale(0.8);transform-origin:top center;margin-bottom:-16px';
    pane.appendChild(el);
  });
}
