# Daniel Birthday Story

Interactive birthday-story website with two modes:

- **Client / Viewer mode** — the default experience seen by the birthday recipient.
- **Admin / Editor mode** — opened from the gear icon and used to create/edit pages and media.

## Quick start

Open the project folder in VS Code and run `index.html` with Live Server.

Typical URL:

```text
http://127.0.0.1:5500/
```

The current admin password is configured in `js/config.js`.
## Project tree

Daniel-birthday-refactored/
│
├── index.html
├── README.md
│
├── css/
│   ├── variables.css
│   ├── base.css
│   ├── viewer.css
│   ├── media.css
│   ├── admin.css
│   └── responsive.css
│
├── js/
│   ├── config.js
│   ├── utils.js
│   ├── state.js
│   ├── storage.js
│   ├── viewer.js
│   ├── media.js
│   ├── navigation.js
│   ├── admin.js
│   ├── editor.js
│   └── app.js
│
├── assets/
│   ├── images/
│   ├── audio/
│   └── video/
│
└── docs/
    ├── AI_CONTEXT.md
    ├── FILE_MAP.md
    └── ARCHITECTURE.md


    מה יש בכל חלק

index.html הוא עכשיו רק השלד של האתר: Viewer, Admin, toolbar, sidebar וכל ה־DOM. אין בו יותר מאות שורות CSS/JS.

css/ מחולק לפי אחריות: עיצוב בסיסי, Viewer, מדיה, Admin ומובייל.

js/config.js מחזיק הגדרות קבועות כמו סיסמת Admin, שמות IndexedDB, גדלי תמונות ורשימת פונטים.

js/utils.js מחזיק helper functions כמו uid(), escHtml(), הודעות, compatibility ל־style/background וזיהוי YouTube.

js/state.js מחזיק את ה־state בזיכרון, מבנה ברירת המחדל, adminMode, העמוד הנבחר ו־media cache.

js/storage.js הוא כל שכבת השמירה. חשוב: הגרסה החדשה שחבר שלך שלח כבר לא משתמשת רק ב־localStorage. הוא עבר ל־IndexedDB ומפריד בין state לבין קובצי המדיה כ־Blob. הוא אפילו כולל migration מהשמירה הישנה ב־localStorage.

js/viewer.js אחראי על הצגת העמודים, progress, backgrounds, overlays והעיצוב של האלמנטים.

js/media.js אחראי על Text/Image/Audio/Video/YouTube ועל נגן האודיו.

js/navigation.js אחראי על Next/Previous, נעילות, swipe, keyboard וגם browser history/Back. בגרסה שחבר שלך שלח כבר יש שם טיפול מפורש בכך שחזרה אחורה צריכה לעבוד גם מעמוד נעול.

js/admin.js אחראי על כניסה ל־Admin, יציאה, שמירה, sidebar במובייל, יצירה ומחיקת עמודים.

js/editor.js הוא החלק הגדול ביותר: עריכת אלמנטים, backgrounds, uploads, drag & drop, עיצוב טקסט, opacity, rotation וכו'. העלאות מדיה בגרסה הזאת כבר נכנסות ל־IndexedDB דרך putMediaBlob() ולא כ־Base64.

js/app.js נשאר קטן ומפעיל את האפליקציה בסוף.