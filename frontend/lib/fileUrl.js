export function fileUrl(relativePath) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const serverBase = apiBase.replace("/api", "");
  return `${serverBase}${relativePath}`;
}