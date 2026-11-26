import path from "node:path";

export function getUploadDirectory() {
  const configuredDirectory =
    process.env.UPLOAD_DIRECTORY || process.env.UPLOAD_DIR;

  return configuredDirectory
    ? path.resolve(configuredDirectory)
    : path.join(process.cwd(), "uploads");
}