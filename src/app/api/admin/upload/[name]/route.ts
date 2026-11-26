import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function getUploadDirectory(): string {
  const directory = process.env.UPLOAD_DIRECTORY;

  if (!directory) {
    throw new Error("UPLOAD_DIRECTORY environment variable is not configured.");
  }

  return path.resolve(directory);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;

    // Validate the uploaded image filename
    const match = /^([a-f0-9]{32})\.(jpg|png|webp)$/i.exec(name);

    if (!match) {
      return NextResponse.json(
        { error: "Invalid image filename." },
        { status: 400 },
      );
    }

    const extension = match[2].toLowerCase();
    const contentType = CONTENT_TYPES[extension];

    if (!contentType) {
      return NextResponse.json(
        { error: "Unsupported image format." },
        { status: 400 },
      );
    }

    // Resolve the directory at runtime from the environment
    const uploadDirectory = getUploadDirectory();

    const filePath = path.join(uploadDirectory, name);

    console.log("[IMAGE SERVE REQUEST]", {
      filename: name,
      filePath,
    });

    // Read the file at runtime
    const imageBuffer = await readFile(filePath);

    return new Response(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(imageBuffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return NextResponse.json(
        { error: "Image not found." },
        { status: 404 },
      );
    }

    console.error("[IMAGE SERVE ERROR]", error);

    return NextResponse.json(
      {
        error: "Unable to serve image.",
      },
      { status: 500 },
    );
  }
}