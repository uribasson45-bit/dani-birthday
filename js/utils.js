// ─── UTILS ───
function uid() { return Math.random().toString(36).slice(2, 10); }

function escHtml(s) {
  return String(s)
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
