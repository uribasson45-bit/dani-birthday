import { getDeployStore } from "@netlify/blobs";

export default async (request) => {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (!key) {
      return new Response("Missing media key", {
        status: 400,
      });
    }

    const store = getDeployStore();

    const blob = await store.get(key, {
      type: "blob",
      consistency: "strong",
    });

    if (!blob) {
      return new Response("Media not found", {
        status: 404,
      });
    }

    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type":
          blob.type || "application/octet-stream",

        "Cache-Control":
          "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Media function failed:", error);

    return new Response("Media error", {
      status: 500,
    });
  }
};