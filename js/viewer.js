// ============================================================
// STARS
// ============================================================
(function() {
  var c = document.getElementById('stars');
  for (var i = 0; i < 80; i++) {
    var s  = document.createElement('div');
    s.className = 'star';
    var sz = Math.random() * 2.5 + 0.5;
    s.style.cssText = 'width:'+sz+'px;height:'+sz+'px;left:'+(Math.random()*100)+'%;top:'+(Math.random()*100)+'%;--d:'+(2+Math.random()*4)+'s;--delay:'+(Math.random()*4)+'s;opacity:'+(Math.random()*.5);
    c.appendChild(s);
  }
})();

// ============================================================
// SIDE PROGRESS
// ============================================================
function renderSideProgress() {
  var sp  = document.getElementById('side-progress');
  var cur = state.currentPage;
  sp.innerHTML = '';
  state.pages.forEach(function(p, i) {
    var pip = document.createElement('div');
    if (i === cur)       pip.className = 'sp-pip sp-active';
    else if (i < cur)    pip.className = 'sp-pip sp-done';
    else if (p.locked)   pip.className = 'sp-pip sp-locked';
    else                 pip.className = 'sp-pip';
    pip.title = p.name + (p.locked && i > cur ? ' 🔒' : '');
    sp.appendChild(pip);
  });
  var lbl = document.createElement('div');
  lbl.className = 'sp-label';
  lbl.textContent = (cur+1) + '/' + state.pages.length;
  sp.appendChild(lbl);
}

// ============================================================
// STYLE APPLICATION
// ============================================================
function applyElementStyle(wrap, innerTextEl, st) {
  if (!st) return;
  var css = [];
  if (st.bg) css.push('background:' + st.bg);
  if (st.opacity !== undefined && st.opacity !== null && st.opacity !== 100) css.push('opacity:' + (st.opacity/100));
  if (st.borderWidth) css.push('border:' + st.borderWidth + 'px solid ' + (st.borderColor || 'var(--gold)'));
  if (st.radius) css.push('border-radius:' + st.radius + 'px');
  if (st.shadow) css.push('box-shadow:0 12px 30px rgba(0,0,0,.45)');
  if (st.rotate) css.push('transform:rotate(' + st.rotate + 'deg)');
  if (css.length) wrap.style.cssText += ';' + css.join(';');

  if (innerTextEl) {
    var tcss = [];
    if (st.fontFamily) tcss.push('font-family:' + st.fontFamily);
    if (st.fontSize) tcss.push('font-size:' + st.fontSize + 'px');
    if (st.bold) tcss.push('font-weight:700');
    if (st.italic) tcss.push('font-style:italic');
    if (st.color) tcss.push('color:' + st.color);
    if (st.align) wrap.style.textAlign = st.align;
    if (st.letterSpacing) tcss.push('letter-spacing:' + st.letterSpacing + 'px');
    if (st.lineHeight) tcss.push('line-height:' + st.lineHeight);
    if (tcss.length) innerTextEl.style.cssText += ';' + tcss.join(';');
  }
}

// ============================================================
// VIEWER
// ============================================================
function renderViewer() {
  var wrap    = document.getElementById('pages-wrap');
  var pb      = document.getElementById('progress-bar');
  var counter = document.getElementById('page-counter');
  var cur     = state.currentPage;
  var total   = state.pages.length;

  pb.innerHTML = '';
  state.pages.forEach(function(p, i) {
    var d = document.createElement('div');
    var cls = 'prog-dot';
    if (i === cur)     cls += ' active';
    else if (i < cur)  cls += ' done';
    else if (p.locked) cls += ' is-locked';
    d.className = cls;
    d.title = p.name + (p.locked && i > cur ? ' 🔒' : '');
    (function(pageIdx, isLocked) {
      d.addEventListener('click', function() {
        if (pageIdx < cur) navigateTo(pageIdx, true);
        else if (pageIdx === cur) return;
        else if (!isLocked) navigateTo(pageIdx, true);
      });
    })(i, p.locked);
    pb.appendChild(d);
  });

  counter.textContent = (cur+1) + ' / ' + total;

  wrap.innerHTML = '';
  state.pages.forEach(function(page, i) {
    var el = document.createElement('div');
    el.className = 'page' + (i === cur ? ' active' : i < cur ? ' exit-left' : ' exit-right');
    el.dataset.idx = i;

    applyPageBackground(el, ensureBackground(page));

    page.elements.forEach(function(e) { el.appendChild(buildViewElement(e)); });

    if (page.locked && i !== cur) {
      var lo = document.createElement('div');
      lo.className = 'lock-overlay';
      lo.innerHTML = '<div class="lock-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div><div class="lock-label">הדף נעול</div><div class="lock-hint">דף זה טרם נפתח</div><button class="lock-back-btn" data-back="1">→ חזרה לדף הקודם</button>';
      var backBtn = lo.querySelector('[data-back]');
      backBtn.addEventListener('click', function() { goPrev(); });
      el.appendChild(lo);
    }
    wrap.appendChild(el);
  });

  document.getElementById('btn-prev').disabled = (cur <= 0);
  document.getElementById('btn-next').disabled = (cur >= total - 1);

  renderSideProgress();
}

function applyPageBackground(el, bg) {
  el.style.background = '';
  var layers = [];
  var colorLayers = [];

  if (bg.overlayOpacity && Number(bg.overlayOpacity) > 0) {
    var oc = bg.overlayColor || '#000000';
    var oa = Math.max(0, Math.min(100, Number(bg.overlayOpacity))) / 100;
    colorLayers.push(hexToRgba(oc, oa));
  }

  if (bg.type === 'color' && bg.value) {
    el.style.background = 'linear-gradient(' + colorLayers.map(function(c){return c+','+c;}).join(',') + (colorLayers.length?',':'') + bg.value + ')';
    if (!colorLayers.length) el.style.background = bg.value;
  } else if (bg.type === 'gradient' && bg.value) {
    var grad = 'linear-gradient(' + (bg.angle||135) + 'deg,' + bg.value + ',' + (bg.value2||bg.value) + ')';
    if (colorLayers.length) {
      el.style.background = 'linear-gradient(' + colorLayers[0] + ',' + colorLayers[0] + '),' + grad;
    } else {
      el.style.background = grad;
    }
  } else if (bg.type === 'image') {
    var pos = bg.position || 'center';
    var fit = bg.fit || 'cover';
    var setUrl = function(url) {
      if (!url) return;
      var stack = [];
      if (colorLayers.length) stack.push('linear-gradient(' + colorLayers[0] + ',' + colorLayers[0] + ')');
      stack.push("url('" + url + "')");
      el.style.background = stack.join(',') + ' ' + pos + '/' + fit + ' no-repeat';
      // ensure the color overlay (first layer) also uses same position/size
      if (colorLayers.length) el.style.backgroundSize = fit + ',' + fit;
    };
    if (bg.mediaId) {
      resolveMediaUrl(bg.mediaId).then(setUrl);
    } else if (bg.value) {
      setUrl(bg.value);
    }
  }
}

function hexToRgba(hex, a) {
  hex = (hex || '#000000').replace('#','');
  if (hex.length === 3) hex = hex.split('').map(function(c){return c+c;}).join('');
  var r = parseInt(hex.substr(0,2),16) || 0;
  var g = parseInt(hex.substr(2,2),16) || 0;
  var b = parseInt(hex.substr(4,2),16) || 0;
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}
