
import { getStore } from "@netlify/blobs";

const STORE_NAME = "birthday-story";
const STORY_KEY = "main-story";

export default async (request) => {
  const store = getStore({
    name: STORE_NAME,
    consistency: "strong",
  });

  if (request.method === "GET") {
    const story = await store.get(STORY_KEY, {
      type: "json",
    });

    if (!story) {
      return Response.json(
        {
          exists: false,
          story: null,
        },
        {
          status: 200,
        }
      );
    }

    return Response.json({
      exists: true,
      story,
    });
  }

  if (request.method === "POST") {
    try {
      const body = await request.json();

      if (
        !body ||
        typeof body !== "object" ||
        !Array.isArray(body.pages)
      ) {
        return Response.json(
          {
            success: false,
            error: "Invalid story data",
          },
          {
            status: 400,
          }
        );
      }

      await store.setJSON(STORY_KEY, body);

      return Response.json({
        success: true,
      });
    } catch (error) {
      console.error("Story save failed:", error);

      return Response.json(
        {
          success: false,
          error: "Could not save story",
        },
        {
          status: 500,
        }
      );
    }
  }

  return new Response("Method Not Allowed", {
    status: 405,
    headers: {
      Allow: "GET, POST",
    },
  });
};