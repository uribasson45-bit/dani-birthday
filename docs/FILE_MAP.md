# FILE MAP

Detailed responsibility map for developers and AI assistants.

---

## `index.html`

### Purpose
Application shell and DOM structure.

### Contains
- document metadata
- Hebrew RTL root configuration
- Google Fonts link
- Client Viewer containers
- top progress bar
- page container
- previous/next navigation buttons
- side progress UI
- admin gear button
- admin login markup
- admin top bar
- editor toolbar
- preview pane
- pages sidebar
- notification element
- CSS links
- ordered JavaScript script tags

### Do not put here
- major application logic
- large CSS blocks
- persistence logic

### Change this file when
- adding/removing a permanent DOM container
- adding a new stylesheet/script
- changing global page metadata

---

# CSS

## `css/variables.css`

### Purpose
Central design tokens.

### Owns
- gold/rose/navy/cream palette
- text colors
- card/border colors
- safe-area variables

### Change when
Changing the global visual theme.

---

## `css/base.css`

### Purpose
Global browser/base styling.

### Owns
- box sizing/reset
- html/body sizing
- global font/color
- mobile tap behavior
- star background animation

### Change when
Changing site-wide defaults or decorative background behavior.

---

## `css/viewer.css`

### Purpose
Client-facing birthday story layout.

### Owns
- app shell
- progress bar/dots
- story page positioning/transitions
- heading/text presentation
- text stroke utility styles
- locked-page overlay
- lock back button
- previous/next navigation
- page counter
- vertical side-progress indicator

### Change when
Changing page transitions, lock presentation, story navigation visuals, or general story text layout.

---

## `css/media.css`

### Purpose
Media presentation in Viewer mode.

### Owns
- image card sizing
- image resize UI
- image placeholders
- audio player layout
- play/restart/progress/volume controls
- video container
- native video presentation
- responsive YouTube iframe wrapper
- video placeholders/title

### Change when
Changing how images/audio/video look.

---

## `css/admin.css`

### Purpose
Admin/editor visual interface.

### Owns
- admin gear
- login overlay/card
- admin topbar
- page sidebar
- editor toolbar
- element cards
- upload controls
- background editor
- design panel
- drag handle presentation
- preview pane
- notifications
- scrollbar styling

### Change when
Changing the admin/editor UI.

---

## `css/responsive.css`

### Purpose
Responsive/mobile overrides.

### Owns
- small-screen preview behavior
- mobile pages drawer
- sidebar scrim
- mobile toolbar sizing
- video width overrides
- iOS safe-area navigation padding

### Change when
Fixing iPhone/Android/tablet-specific layout.

---

# JAVASCRIPT

## `js/config.js`

### Purpose
Static application configuration.

### Owns
- `ADMIN_PASSWORD`
- legacy/local database key constants
- IndexedDB name/version/store names
- main persisted state key
- `IMG_SIZES`
- `FONT_OPTIONS`

### Key dependency
Loaded first.

### Change when
Changing database identifiers, global configuration, supported image sizes, or editor font options.

---

## `js/state.js`

### Purpose
In-memory application state and default data shape.

### Owns
- `defaultStyle()`
- initial `state`
- default first page
- `adminMode`
- `selectedPageIdx`
- swipe tracking variables
- media object-URL runtime cache

### Key dependency
Uses `uid()` immediately when initial state is created.  
Therefore `utils.js` MUST load before `state.js` in `index.html`.

This is a cross-file consequence of splitting the original single `<script>` block, where function declarations were hoisted across the whole block.

### Change when
Adding new top-level state fields or changing default page/element structure.

---

## `js/utils.js`

### Purpose
Shared helpers used across the project.

### Owns
- `uid()`
- `escHtml()`
- `notify()`
- `ensureStyle()`
- `ensureBackground()`
- `getYouTubeId()`
- `isYouTubeUrl()`

### Change when
Adding reusable generic helpers or compatibility/migration defaults.

---

## `js/storage.js`

### Purpose
All browser persistence and uploaded-media storage.

### Owns
- IndexedDB connection
- IndexedDB transactions
- `idbGet()`
- `idbSet()`
- `idbDelete()`
- `putMediaBlob()`
- `resolveMediaUrl()`
- base64/DataURL to Blob migration helper
- serializable state generation
- `saveState()`
- legacy localStorage migration
- `loadState()`

### Important behavior
Media is kept as Blob data in a separate IndexedDB store.  
Do not put uploaded binary data directly back into the state JSON.

### Change when
Working on save/load, browser storage, media persistence, migration, or future backend/cloud synchronization.

---

## `js/viewer.js`

### Purpose
Rendering the client-facing story.

### Owns
- star generation
- side progress rendering
- application of custom element styles
- `renderViewer()`
- page/background rendering logic
- background colors/gradients/images
- overlay processing
- color conversion helper

### Calls / depends on
- `state`
- `ensureBackground()`
- `buildViewElement()` from `media.js`
- `navigateTo()` / `goPrev()` from navigation
- media URL resolution for uploaded background images

### Change when
Changing page rendering, progress, backgrounds, locks, or general story presentation.

---

## `js/media.js`

### Purpose
Create/render individual story content elements and run media players.

### Owns
- `buildViewElement()`
- heading/subheading/text rendering
- image rendering
- local `mediaId` image resolution
- audio markup/runtime
- video rendering
- YouTube iframe rendering
- local uploaded video resolution
- `initAudioElement()`
- audio play/pause
- progress/time
- restart
- volume

### Calls / depends on
- `ensureStyle()`
- `applyElementStyle()`
- `IMG_SIZES`
- `getYouTubeId()`
- `resolveMediaUrl()`

### Change when
Fixing YouTube, MP4, audio playback, images, or client-side media rendering.

---

## `js/navigation.js`

### Purpose
All Viewer navigation behavior.

### Owns
- `navigateTo()`
- `goNext()`
- `goPrev()`
- browser History API integration
- `popstate`
- previous/next buttons
- touch swipe
- keyboard arrows

### Important behavior
- forward navigation checks locked destination pages
- backward navigation is intended to work even from problematic/locked states
- browser/phone Back behavior is integrated using history state/hash

### Change when
Fixing page movement, lock navigation, swipe, keyboard, browser Back/Forward, or URL hash behavior.

---

## `js/admin.js`

### Purpose
Admin-mode lifecycle and page management.

### Owns
- gear-button login opening
- password verification
- `enterAdmin()`
- `exitAdmin()`
- Save button integration
- mobile pages sidebar drawer/scrim
- `renderAdminSidebar()`
- add page
- delete page

### Calls / depends on
- editor render functions
- state
- storage save
- Viewer render
- page-name application

### Change when
Changing login, admin open/close, save behavior, mobile page drawer, or page creation/deletion.

---

## `js/editor.js`

### Purpose
The main Admin page/element editor.

### Owns
- `getPage()`
- `applyPageName()`
- `renderEditor()`
- page background editor
- color/gradient/image background controls
- overlay controls
- lock toggle
- add-element toolbar logic
- element creation defaults
- drag-to-reorder behavior
- element editor-card construction
- text fields
- image upload/source fields
- audio upload/source/autoplay/volume fields
- video/YouTube upload/source/autoplay fields
- element delete/up/down/design actions
- design panel builder
- typography controls
- alignment
- spacing/line-height
- background/borders/radius
- shadow
- opacity
- rotation
- delegated design events
- preview rendering

### Calls / depends on
- `state`
- `ensureStyle()`
- `ensureBackground()`
- `putMediaBlob()`
- `isYouTubeUrl()`
- `FONT_OPTIONS`
- `buildViewElement()`
- admin sidebar helpers

### Change when
Adding or modifying Admin editing capabilities.

This is currently the largest and most feature-dense JS file.

---

## `js/app.js`

### Purpose
Application bootstrap only.

### Owns
Startup sequence after every other script has loaded.

### Typical responsibilities
- restore persisted state
- initialize browser history state
- render Viewer

### Rule
Keep this file small and load it LAST.

---

# ASSETS

## `assets/images/`
Reserved for repository-hosted image files.

Uploaded images selected from Admin currently use IndexedDB instead.

## `assets/audio/`
Reserved for repository-hosted audio.

Uploaded audio selected from Admin currently uses IndexedDB.

## `assets/video/`
Reserved for repository-hosted video.

Uploaded video selected from Admin currently uses IndexedDB.

---

# DOCS

## `docs/AI_CONTEXT.md`
Compact project briefing intended to be attached/pasted into future AI chats.

## `docs/FILE_MAP.md`
This document. Detailed ownership map for every project file.

## `docs/ARCHITECTURE.md`
More conceptual explanation of data flow and dependencies.
