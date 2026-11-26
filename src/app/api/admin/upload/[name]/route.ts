import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const UPLOAD_DIRECTORY = "D:\\moodfood\\uploads";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    // 1. Get filename from URL
    const { name } = await params;

    // 2. Validate filename
    const match = /^([a-f0-9]{32})\.(jpg|png|webp)$/i.exec(name);

    if (!match) {
      return NextResponse.json(
        {
          error: "Invalid image filename.",
        },
        { status: 400 }
      );
    }

    const extension = match[2].toLowerCase();

    // 3. Use the same fixed upload directory
    const filePath = path.join(UPLOAD_DIRECTORY, name);

    console.log("[IMAGE SERVE REQUEST]", {
      filename: name,
      filePath,
    });

    // 4. Read image
    const imageBuffer = await readFile(filePath);

    // 5. Return image
    return new Response(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        "Content-Type": CONTENT_TYPES[extension],
        "Content-Length": String(imageBuffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[IMAGE SERVE ERROR]", error);

    return NextResponse.json(
      {
        error: "Image not found.",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 404 }
    );
  }
}