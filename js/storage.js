// ============================================================
// INDEXEDDB PERSISTENCE LAYER
// ------------------------------------------------------------
// Why IndexedDB instead of localStorage:
// localStorage has a hard ~5-10MB quota shared by the *whole* string,
// and every uploaded photo/mp3 was being embedded as base64 text inside
// that single JSON blob. A couple of songs + photos would silently blow
// the quota and "Save" would fail without changes actually persisting.
// IndexedDB stores binary Blobs directly (no base64 bloat) in a separate
// object store, has a much larger quota (typically hundreds of MB+),
// and survives refresh reliably. The page JSON (text, tiny) lives in one
// store; uploaded files live as Blobs in another, referenced by id.
// ============================================================
var _dbPromise = null;
function openDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise(function(resolve, reject) {
    if (!window.indexedDB) { reject(new Error('no-idb')); return; }
    var req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = function(ev) {
      var db = ev.target.result;
      if (!db.objectStoreNames.contains(IDB_STATE_STORE)) db.createObjectStore(IDB_STATE_STORE);
      if (!db.objectStoreNames.contains(IDB_MEDIA_STORE)) db.createObjectStore(IDB_MEDIA_STORE);
    };
    req.onsuccess = function(ev) { resolve(ev.target.result); };
    req.onerror = function() { reject(req.error); };
  });
  return _dbPromise;
}
function idbTx(storeName, mode) {
  return openDB().then(function(db) { return db.transaction(storeName, mode).objectStore(storeName); });
}
function idbGet(storeName, key) {
  return idbTx(storeName, 'readonly').then(function(store) {
    return new Promise(function(resolve, reject) {
      var r = store.get(key);
      r.onsuccess = function() { resolve(r.result); };
      r.onerror = function() { reject(r.error); };
    });
  });
}
function idbSet(storeName, key, val) {
  return idbTx(storeName, 'readwrite').then(function(store) {
    return new Promise(function(resolve, reject) {
      var r = store.put(val, key);
      r.onsuccess = function() { resolve(true); };
      r.onerror = function() { reject(r.error); };
    });
  });
}
function idbDelete(storeName, key) {
  return idbTx(storeName, 'readwrite').then(function(store) {
    return new Promise(function(resolve, reject) {
      var r = store.delete(key);
      r.onsuccess = function() { resolve(true); };
      r.onerror = function() { reject(r.error); };
    });
  });
}

function putMediaBlob(blob) {
  var id = 'm_' + uid() + uid();
  return idbSet(IDB_MEDIA_STORE, id, blob).then(function() { return id; });
}

// Resolve a mediaId to a usable object URL (cached), returns a Promise<string|null>
function resolveMediaUrl(mediaId) {
  if (!mediaId) return Promise.resolve(null);
  if (_mediaUrlCache[mediaId]) return Promise.resolve(_mediaUrlCache[mediaId]);
  return idbGet(IDB_MEDIA_STORE, mediaId).then(function(blob) {
    if (!blob) return null;
    var url = URL.createObjectURL(blob);
    _mediaUrlCache[mediaId] = url;
    return url;
  }).catch(function() { return null; });
}

function dataURLtoBlob(dataUrl) {
  var parts = dataUrl.split(',');
  var mimeMatch = parts[0].match(/:(.*?);/);
  var mime = mimeMatch ? mimeMatch[1] : '';
  var bin = atob(parts[1]);
  var arr = new Uint8Array(bin.length);
  for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// Strip non-serializable/huge fields before persisting page JSON
function serializableState() {
  return JSON.parse(JSON.stringify(state));
}

function saveState() {
  applyPageName();

  var data = serializableState();

  return fetch('/.netlify/functions/story', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(function(response) {
    if (!response.ok) {
      throw new Error('Cloud save failed: ' + response.status);
    }

    return response.json();
  })
  .then(function(result) {
    if (!result || result.success !== true) {
      throw new Error('Cloud save rejected');
    }

    // Keep a local cache too.
    return idbSet(
      IDB_STATE_STORE,
      STATE_KEY,
      data
    );
  })
  .then(function() {
    notify('נשמר בענן! ✓');
    return true;
  })
  .catch(function(error) {
    console.warn('saveState failed', error);

    notify('שגיאה בשמירה לענן');

    return false;
  });
}


// One-time migration: pull any pre-existing localStorage save (old base64 format)
// into the new IndexedDB + blob-store format, so nobody loses their story.
function migrateFromLocalStorage() {
  var raw;
  try { raw = localStorage.getItem(OLD_STORAGE_KEY); } catch(e) { raw = null; }
  if (!raw) return Promise.resolve(false);
  var parsed;
  try { parsed = JSON.parse(raw); } catch(e) { return Promise.resolve(false); }
  if (!parsed || !Array.isArray(parsed.pages)) return Promise.resolve(false);

  var jobs = [];
  parsed.pages.forEach(function(p) {
    if (!p.background) p.background = { type: 'none', value: '' };
    ensureBackground(p);
    if (p.background.type === 'image' && p.background.value && p.background.value.indexOf('data:') === 0) {
      var blob = dataURLtoBlob(p.background.value);
      jobs.push(putMediaBlob(blob).then(function(id) {
        p.background.mediaId = id;
        p.background.value = '';
      }));
    }
    (p.elements || []).forEach(function(e) {
      ensureStyle(e);
      if ((e.type === 'image' || e.type === 'audio' || e.type === 'video') && e.src && e.src.indexOf('data:') === 0) {
        var blob2 = dataURLtoBlob(e.src);
        jobs.push(putMediaBlob(blob2).then(function(id) {
          e.mediaId = id;
          e.src = '';
        }));
      }
    });
  });

  return Promise.all(jobs).then(function() {
    state = parsed;
    return idbSet(IDB_STATE_STORE, STATE_KEY, serializableState());
  }).then(function() {
    try { localStorage.removeItem(OLD_STORAGE_KEY); } catch(e) {}
    notify('הסיפור שוחזר ושודרג לשמירה חדשה ✓');
    return true;
  });
}

function loadLocalState() {
  return openDB()
    .catch(function() {
      return null;
    })
    .then(function(db) {

      if (!db) {

        // Very old browser fallback.
        try {
          var raw =
            localStorage.getItem(
              OLD_STORAGE_KEY
            );

          if (raw) {
            var parsed =
              JSON.parse(raw);

            if (
              parsed &&
              Array.isArray(parsed.pages)
            ) {
              state = parsed;
            }
          }
        } catch (e) {}

        return;
      }

      return idbGet(
        IDB_STATE_STORE,
        STATE_KEY
      ).then(function(saved) {

        if (
          saved &&
          Array.isArray(saved.pages)
        ) {
          state = saved;

          state.pages.forEach(function(page) {
            ensureBackground(page);

            (page.elements || [])
              .forEach(ensureStyle);
          });

          return;
        }

        // Nothing in IndexedDB:
        // try the old localStorage migration.
        return migrateFromLocalStorage();
      });
    });
}
function loadState() {

  // 1. First try the shared cloud story.
  return fetch('/.netlify/functions/story', {
    method: 'GET',
    cache: 'no-store'
  })
  .then(function(response) {
    if (!response.ok) {
      throw new Error(
        'Cloud load failed: ' + response.status
      );
    }

    return response.json();
  })
  .then(function(result) {

    if (
      result &&
      result.exists &&
      result.story &&
      Array.isArray(result.story.pages)
    ) {

      state = result.story;

      state.pages.forEach(function(page) {
        ensureBackground(page);

        (page.elements || []).forEach(function(element) {
          ensureStyle(element);
        });
      });

      // Save cloud state as local offline cache.
      return idbSet(
        IDB_STATE_STORE,
        STATE_KEY,
        serializableState()
      ).catch(function() {
        // Cache failure must not prevent the site loading.
      });
    }

    /*
     * Cloud is reachable but no story has been saved yet.
     * Fall back to the existing local story.
     */
    return loadLocalState();
  })
  .catch(function(error) {

    console.warn(
      'Cloud unavailable, using local cache',
      error
    );

    return loadLocalState();
  });
}

function resolveCloudMediaUrl(mediaKey){
  if (!mediaKey) return null;
  return(
    '/.netlify/functions/media?key=' + 
    encodeURIComponent(mediaKey)
  );
}

// ============================================================
// MEDIA MIGRATION SCAN
// ============================================================

async function scanLocalMediaForMigration() {
  var found = [];
  var seen = {};

  function addMedia(mediaId, type, fileName, location) {
    if (!mediaId || seen[mediaId]) return;

    seen[mediaId] = true;

    found.push({
      mediaId: mediaId,
      type: type,
      fileName: fileName || '',
      location: location || ''
    });
  }

  state.pages.forEach(function(page, pageIndex) {

    // Background image
    if (
      page.background &&
      page.background.mediaId
    ) {
      addMedia(
        page.background.mediaId,
        'background',
        '',
        'עמוד ' + (pageIndex + 1) + ' - רקע'
      );
    }

    // Page elements
    (page.elements || []).forEach(function(el, elementIndex) {

      if (!el.mediaId) return;

      addMedia(
        el.mediaId,
        el.type,
        el.fileName || '',
        'עמוד ' +
          (pageIndex + 1) +
          ' - אלמנט ' +
          (elementIndex + 1)
      );
    });
  });


  var results = [];

  for (var i = 0; i < found.length; i++) {

    var item = found[i];

    try {

      var blob = await idbGet(
        IDB_MEDIA_STORE,
        item.mediaId
      );

      if (!blob) {

        results.push({
          mediaId: item.mediaId,
          type: item.type,
          fileName: item.fileName,
          location: item.location,
          exists: false,
          size: 0,
          sizeMB: 0,
          mimeType: ''
        });

        continue;
      }


      results.push({
        mediaId: item.mediaId,
        type: item.type,
        fileName: item.fileName,
        location: item.location,
        exists: true,
        size: blob.size,
        sizeMB: Number(
          (
            blob.size /
            1024 /
            1024
          ).toFixed(2)
        ),
        mimeType: blob.type || ''
      });

    } catch (error) {

      results.push({
        mediaId: item.mediaId,
        type: item.type,
        fileName: item.fileName,
        location: item.location,
        exists: false,
        error: String(error)
      });
    }
  }


  console.table(results);

  return results;
}