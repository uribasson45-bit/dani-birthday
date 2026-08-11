// ─── PERSISTENCE ───
function loadState() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      // Migrate old saves: ensure background field exists
      if (parsed && Array.isArray(parsed.pages)) {
        parsed.pages.forEach(function(p) {
          if (!p.background) p.background = { type: 'none', value: '' };
        });
      }
      state = parsed;
    }
  } catch(e) { console.warn('loadState failed', e); }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    notify('נשמר! ✓');
  } catch(e) {
    notify('שגיאה בשמירה – הקבצים גדולים מדי');
  }
}
