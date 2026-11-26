import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

// Fixed upload location
const UPLOAD_DIRECTORY = "D:\\moodfood\\uploads";

type ImageExtension = "jpg" | "png" | "webp";

/**
 * Detect image format from file bytes.
 * Do not trust the original filename or MIME type.
 */
function detectExtension(bytes: Buffer): ImageExtension | null {
  // JPEG
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "jpg";
  }

  // PNG
  if (
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(
      Buffer.from([
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a,
      ])
    )
  ) {
    return "png";
  }

  // WebP
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    // 1. Authenticate admin
    const authenticated = await isAdminAuthenticated();

    if (!authenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Please sign in again.",
        },
        { status: 401 }
      );
    }

    // 2. Parse multipart form
    const formData = await request.formData().catch(() => null);

    if (!formData) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid upload request.",
        },
        { status: 400 }
      );
    }

    // 3. Get file
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please select an image.",
        },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "The uploaded image is empty.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: "Image size must be 5 MB or smaller.",
        },
        { status: 413 }
      );
    }

    // 5. Read file bytes
    const bytes = Buffer.from(await file.arrayBuffer());

    // 6. Validate actual image type
    const extension = detectExtension(bytes);

    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          error: "Only JPG, PNG and WebP images are supported.",
        },
        { status: 415 }
      );
    }

    // 7. Generate secure filename
    const fileName = `${randomBytes(16).toString("hex")}.${extension}`;

    // 8. Ensure upload directory exists
    await mkdir(UPLOAD_DIRECTORY, {
      recursive: true,
    });

    // 9. Create absolute file path
    const filePath = path.join(UPLOAD_DIRECTORY, fileName);

    // 10. Save image
    await writeFile(filePath, bytes, {
      flag: "wx",
    });

    console.log("[IMAGE UPLOAD SUCCESS]", {
      fileName,
      filePath,
      size: bytes.length,
    });

    // 11. Return image URL
    const imageUrl = `/api/uploads/${fileName}`;

    return NextResponse.json(
      {
        success: true,
        message: "Image uploaded successfully.",
        url: imageUrl,
        fileName,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[IMAGE UPLOAD ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload image.",
      },
      { status: 500 }
    );
  }
}