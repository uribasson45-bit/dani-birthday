# AI CONTEXT — Daniel Birthday Story

Paste this file into a new AI conversation when asking for development help.

## 1. Product overview

This project is an interactive Hebrew RTL birthday-story website.

There are two user experiences:

### Client / Viewer mode
This is the default mode when the site opens.

The viewer:
- displays the birthday story as multiple pages
- moves between pages with navigation buttons
- supports touch swipe
- supports keyboard navigation
- uses browser history/hash state
- shows progress indicators
- supports locked pages
- displays text, images, audio and video/YouTube elements
- supports custom per-page backgrounds

### Admin / Editor mode
The gear icon opens an admin login.

After login, the editor can:
- create/delete story pages
- rename pages
- lock/unlock pages
- add headings, subheadings and text
- add images, audio and video/YouTube
- upload local media
- reorder elements
- change page backgrounds
- change element visual styling
- preview the selected page
- save changes locally

## 2. Technical approach

This is currently a vanilla static web application:

- HTML
- CSS
- plain browser JavaScript
- no framework
- no bundler
- no npm runtime requirement
- no backend in this branch

JavaScript files deliberately use the shared global browser scope.  
They are NOT ES modules.

Because of that, the order of `<script>` tags in `index.html` matters.

Current order:

```text
config.js
utils.js
state.js
storage.js
viewer.js
media.js
navigation.js
admin.js
editor.js
app.js
```

`utils.js` must load before `state.js` because the initial state calls `uid()` immediately. `app.js` must remain last because it starts the application.

## 3. Persistence

The application uses IndexedDB.

Configured database:
- database name: `birthday_story_db_v1`
- version: `1`
- state store: `state`
- media store: `media`
- main state key: `app`

Legacy key:
- `birthday_story_v5` in localStorage

### State persistence
Page definitions and element metadata are saved as JSON-like application state.

### Media persistence
Uploaded local files are stored as binary Blobs in IndexedDB.

Each uploaded item receives a `mediaId`.

At runtime:
`mediaId -> IndexedDB Blob -> URL.createObjectURL(blob) -> browser-renderable URL`

There is an in-memory `_mediaUrlCache`.

### Legacy migration
If IndexedDB has no existing story, the app attempts to migrate an old `localStorage` story.

Legacy base64 media is converted back into Blob data and moved into IndexedDB.

IMPORTANT:
IndexedDB is local to the browser/device. It is not cloud synchronization.

## 4. Core data model

Top-level state:

```js
state = {
  pages: [...],
  currentPage: 0
}
```

Each page roughly contains:

```js
{
  id,
  name,
  locked,
  background,
  elements
}
```

Background supports fields such as:

```js
{
  type,
  value,
  value2,
  angle,
  position,
  fit,
  overlayColor,
  overlayOpacity,
  mediaId
}
```

Element types currently include:

```text
heading
subheading
text
image
audio
video
```

Each element can contain a `style` object.

Default style fields:

```text
fontFamily
fontSize
bold
italic
color
align
letterSpacing
lineHeight
bg
opacity
borderWidth
borderColor
radius
shadow
rotate
```

Media elements may use:
- `src` for external URLs
- `mediaId` for locally uploaded Blob media

## 5. Major flows

### Startup

```text
index.html
  ↓
load all JS files
  ↓
app.js
  ↓
loadState()
  ↓
restore/migrate IndexedDB data
  ↓
renderViewer()
```

### Admin save

```text
Admin editing
  ↓
state object changes in memory
  ↓
Save
  ↓
saveState()
  ↓
IndexedDB state store
```

### Uploaded media

```text
User selects file
  ↓
putMediaBlob(file)
  ↓
IndexedDB media store
  ↓
element.mediaId
  ↓
resolveMediaUrl(mediaId)
  ↓
object URL
  ↓
image/audio/video element
```

### Viewer navigation

Navigation is handled by `navigation.js`.

It includes:
- next/previous
- locked-page checking
- browser `history.pushState`
- `popstate`
- touch swipe
- keyboard navigation

Backward navigation is intended to remain available even when dealing with locked pages.

## 6. Known architectural limitations

1. Admin password is client-side and therefore is not true security.
2. IndexedDB storage is local-only. Other devices do not automatically receive saved pages/media.
3. Large media is still limited by browser storage/quota and device resources.
4. YouTube embed availability depends on the specific YouTube video and its embedding restrictions.
5. The files use global functions/variables; renaming or changing load order can break cross-file dependencies.
6. There is currently no API/backend/cloud database in this refactor.

## 7. How an AI should modify this project

When making a change:

- do not rewrite the entire project unless necessary
- identify the owning file from `FILE_MAP.md`
- preserve public/global function names unless the change intentionally updates every caller
- consider IndexedDB asynchronous behavior
- remember `resolveMediaUrl()` returns a Promise
- preserve RTL/mobile behavior
- test both Viewer and Admin
- do not silently replace IndexedDB with localStorage
- do not move uploaded Blob data into JSON/base64 state
- do not convert files to ES modules unless the whole dependency model is intentionally migrated

## 8. Recommended information to give an AI in a future chat

Example prompt:

> This is a vanilla JS birthday-story website. Read the attached `AI_CONTEXT.md` and `FILE_MAP.md` first. I want to change the YouTube/video behavior. The relevant implementation is mainly in `js/media.js`, while the editor form for video elements is in `js/editor.js`. Preserve IndexedDB media storage and do not modify unrelated behavior.

For navigation:

> Read `AI_CONTEXT.md`. Work mainly in `js/navigation.js` and only touch `js/viewer.js` if rendering behavior must change. Back navigation must remain possible and locked pages must not trap the user.

For editor changes:

> Read `AI_CONTEXT.md` and `FILE_MAP.md`. Work in `js/editor.js`. Keep the state schema backward compatible and use the existing `ensureStyle()` / `ensureBackground()` migration helpers when adding optional fields.
