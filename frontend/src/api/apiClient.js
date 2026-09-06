const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const BASE_URL = RAW_BASE.replace(/\/+$/, "");

function normalizeError(data, status) {
  if (!data) return `Request failed (${status})`;

  if (typeof data === "string") return data;

  // FastAPI validation shape
  if (Array.isArray(data.detail)) {
    return data.detail.map((d) => d.msg).join(", ");
  }

  if (typeof data.detail === "string") return data.detail;

  if (typeof data.message === "string") return data.message;

  return `Request failed (${status})`;
}

async function request(path, options = {}, token = null) {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = normalizeError(data, res.status);
    throw new Error(msg);
  }

  return data;
}

export const apiClient = {
  get: (path, token = null) => request(path, {}, token),
  post: (path, body, token = null) =>
    request(path, { method: "POST", body: JSON.stringify(body) }, token),
  put: (path, body, token = null) =>
    request(path, { method: "PUT", body: JSON.stringify(body) }, token),
  delete: (path, token = null) => request(path, { method: "DELETE" }, token),
};
