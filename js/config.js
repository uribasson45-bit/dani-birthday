// ============================================================
// CONSTANTS
// ============================================================
var ADMIN_PASSWORD   = '1234';
var OLD_STORAGE_KEY  = 'birthday_story_v5';   // legacy localStorage key (migrated automatically)
var IDB_NAME         = 'birthday_story_db_v1';
var IDB_VERSION      = 1;
var IDB_STATE_STORE  = 'state';
var IDB_MEDIA_STORE  = 'media';
var STATE_KEY        = 'app';

// ============================================================
// IMG SIZE MAP
// ============================================================
var IMG_SIZES = {
  small:  { label: 'קטן',   maxW: '240px',              maxH: '30vh' },
  medium: { label: 'בינוני', maxW: '400px',              maxH: '45vh' },
  large:  { label: 'גדול',  maxW: 'min(520px,92vw)',    maxH: '60vh' },
  full:   { label: 'מלא',   maxW: 'min(620px,96vw)',    maxH: '75vh' }
};

var FONT_OPTIONS = [
  { v: '', label: 'ברירת מחדל' },
  { v: "'Playfair Display',serif", label: 'Playfair Display' },
  { v: "'Lato',sans-serif", label: 'Lato' },
  { v: "'Heebo',sans-serif", label: 'Heebo' },
  { v: "'Assistant',sans-serif", label: 'Assistant' },
  { v: "'Rubik',sans-serif", label: 'Rubik' },
  { v: "Georgia,serif", label: 'Georgia' },
  { v: "'Courier New',monospace", label: 'Courier New' }
];
