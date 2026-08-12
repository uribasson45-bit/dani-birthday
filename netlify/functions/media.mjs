import { getStore } from "@netlify/blobs";

const STORE_NAME = "birthday-media";

function getContentType(key) {
  const ext = key.split(".").pop()?.toLowerCase();

  const types = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",

    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    m4a: "audio/mp4",

    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime"
  };

  return types[ext] || "application/octet-stream";
}

export default async (request) => {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new Response("Missing media key", {
        status: 400
      });
    }

    const store = getStore(STORE_NAME);

    const data = await store.get(key, {
      type: "arrayBuffer",
      consistency: "strong"
    });

    if (!data) {
      return new Response("Media not found", {
        status: 404
      });
    }

    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": getContentType(key),
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=3600"
      }
    });

  } catch (error) {
    console.error("Media function failed:", error);

    return new Response("Media error", {
      status: 500
    });
  }
};