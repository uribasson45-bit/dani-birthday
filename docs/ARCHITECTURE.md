# Architecture

## Runtime layers

```text
┌────────────────────────────────────────────────────────────┐
│                       index.html                           │
│              DOM shell + CSS/JS loading                   │
└──────────────────────────┬─────────────────────────────────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
┌─────────────────┐                ┌─────────────────┐
│  Client Viewer  │                │  Admin Editor   │
│ viewer/media/   │                │ admin/editor    │
│ navigation      │                │                 │
└────────┬────────┘                └────────┬────────┘
         │                                  │
         └──────────────┬───────────────────┘
                        ▼
                ┌───────────────┐
                │ state.js      │
                │ in-memory     │
                │ story state   │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ storage.js    │
                │ IndexedDB     │
                └───────┬───────┘
                        │
             ┌──────────┴──────────┐
             ▼                     ▼
       state object store     media object store
       page JSON/state        Blob files
```

## Media flow

```text
Admin file input
      │
      ▼
putMediaBlob(file)
      │
      ▼
IndexedDB media store
      │
      ▼
mediaId stored on element/page background
      │
      ▼
resolveMediaUrl(mediaId)
      │
      ▼
URL.createObjectURL(blob)
      │
      ▼
<img> / <audio> / <video> / background-image
```

## Why mediaId matters

The original legacy approach stored uploaded files as base64 inside localStorage JSON.

The supplied version has already moved to IndexedDB:
- binary data is not embedded in the page state JSON
- media is stored separately as Blob values
- elements hold lightweight references

Future changes should preserve this separation unless moving to a real backend/object-storage architecture.

## Script dependencies

The project intentionally remains plain scripts in global scope.

Conceptual dependency graph:

```text
config
  │
utils
  │
state ─────────────┐
  │                │
storage            │
  │                │
viewer ◄──────── media
  │                │
navigation         │
  │                │
admin ◄──────── editor
  │
app (bootstrap)
```

Because many functions are called later rather than immediately, some definitions can technically appear in different files before startup. Still, do not casually reorder scripts.

## Viewer versus Admin

The application should open in Viewer mode.

Admin mode is an overlay/editor experience opened via the gear icon.

Editing updates the shared in-memory `state`. Saving persists that state to IndexedDB.

Exiting Admin returns to the Viewer and rendering should reflect current state.

## Persistence limitation

IndexedDB fixes the localStorage size/base64 problem, but it does NOT make this multi-user.

Example:

```text
Friend's Chrome IndexedDB  !=  Girlfriend's iPhone IndexedDB
```

To make Admin saves visible to every device, a future architecture needs server/cloud storage.

That future work should be isolated primarily behind `storage.js` where possible, so UI code does not need to know where data is physically stored.

## Safe future backend direction

A future storage interface can retain functions such as:

```text
loadState()
saveState()
putMediaBlob()
resolveMediaUrl()
```

and change their internal implementation from browser IndexedDB to:
- cloud database for state
- object storage/CDN for media
- authenticated admin API

This is preferable to rewriting Viewer and Editor logic.


## Important split-file initialization note

In the original single HTML file, `state` could call `uid()` even though the textual
`uid()` declaration appeared later, because function declarations were hoisted within
one script.

After splitting the code, browser script files execute sequentially. Therefore:

```text
utils.js -> state.js
```

is a required load-order dependency.
