// ============================================================
// UTILS
// ============================================================
function uid() { return Math.random().toString(36).slice(2, 10); }

function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

var _notifTimer = null;
function notify(msg) {
  var n = document.getElementById('notif');
  n.textContent = msg;
  n.classList.add('show');
  clearTimeout(_notifTimer);
  _notifTimer = setTimeout(function() { n.classList.remove('show'); }, 2400);
}

function ensureStyle(el) {
  if (!el.style || typeof el.style !== 'object') el.style = defaultStyle();
  var d = defaultStyle();
  for (var k in d) { if (el.style[k] === undefined) el.style[k] = d[k]; }
  return el.style;
}
function ensureBackground(p) {
  if (!p.background) p.background = {};
  var d = { type:'none', value:'', value2:'', angle:135, position:'center', fit:'cover', overlayColor:'#000000', overlayOpacity:0 };
  for (var k in d) { if (p.background[k] === undefined) p.background[k] = d[k]; }
  return p.background;
}

// ============================================================
// YOUTUBE HELPERS
// ============================================================
function getYouTubeId(url) {
  if (!url) return null;
  var patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = url.match(patterns[i]);
    if (m) return m[1];
  }
  return null;
}
function isYouTubeUrl(url) { return !!getYouTubeId(url); }
