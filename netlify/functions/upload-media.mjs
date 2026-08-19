import { getStore } from "@netlify/blobs";

const STORE_NAME = "birthday-media";

export default async function handler(request) {
  try {
    if (request.method !== "POST") {
      return new Response(
        "Method Not Allowed",
        {
          status: 405,
          headers: {
            Allow: "POST"
          }
        }
      );
    }

    const url =
      new URL(request.url);

    const key =
      url.searchParams.get("key");

    if (!key) {
      return Response.json(
        {
          success: false,
          error: "Missing media key"
        },
        {
          status: 400
        }
      );
    }


    const contentType =
      request.headers.get(
        "content-type"
      ) ||
      "application/octet-stream";


    const data =
      await request.arrayBuffer();


    if (!data.byteLength) {
      return Response.json(
        {
          success: false,
          error: "Empty file"
        },
        {
          status: 400
        }
      );
    }


    const store =
      getStore(
        STORE_NAME
      );


    await store.set(
      key,
      data,
      {
        metadata: {
          contentType: contentType,
          uploadedAt:
            new Date().toISOString()
        }
      }
    );


    return Response.json(
      {
        success: true,
        key: key,
        size: data.byteLength,
        contentType: contentType
      }
    );

  } catch (error) {

    console.error(
      "Media upload failed:",
      error
    );


    return Response.json(
      {
        success: false,
        error:
          "Could not upload media"
      },
      {
        status: 500
      }
    );
  }
}