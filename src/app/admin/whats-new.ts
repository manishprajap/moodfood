export type WhatsNewInput = {
  title: string;
  description: string;
  version?: string | null;
  releasedAt?: Date;
  isPublished?: boolean;
};

type ParseResult =
  | {
      data: WhatsNewInput;
    }
  | {
      error: string;
    };

export function parseWhatsNewInput(body: unknown): ParseResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Invalid request body." };
  }

  const input = body as Record<string, unknown>;

  const title =
    typeof input.title === "string"
      ? input.title.trim()
      : "";

  const description =
    typeof input.description === "string"
      ? input.description.trim()
      : "";

  const version =
    typeof input.version === "string"
      ? input.version.trim()
      : null;

  if (!title) {
    return { error: "Title is required." };
  }

  if (title.length > 255) {
    return { error: "Title cannot exceed 255 characters." };
  }

  if (!description) {
    return { error: "Description is required." };
  }

  if (version && version.length > 50) {
    return { error: "Version cannot exceed 50 characters." };
  }

  let releasedAt: Date | undefined;

  if (input.releasedAt !== undefined && input.releasedAt !== null && input.releasedAt !== "") {
    releasedAt = new Date(String(input.releasedAt));

    if (Number.isNaN(releasedAt.getTime())) {
      return { error: "Invalid release date." };
    }
  }

  let isPublished = true;

  if (input.isPublished !== undefined) {
    if (typeof input.isPublished !== "boolean") {
      return { error: "isPublished must be true or false." };
    }

    isPublished = input.isPublished;
  }

  const data: WhatsNewInput = {
    title,
    description,
    version: version || null,
    isPublished,
  };

  if (releasedAt) {
    data.releasedAt = releasedAt;
  }

  return { data };
}