const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const BASE_URL = RAW_BASE.replace(/\/+$/, ""); // remove trailing slash safely

async function request(path, options = {}) {
  try {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = `${BASE_URL}${normalizedPath}`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const isJson = res.headers
      .get("content-type")
      ?.includes("application/json");
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      throw new Error(data?.detail || `HTTP ${res.status}`);
    }

    return data;
  } catch (err) {
    throw new Error(err.message || "Network error");
  }
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) =>
    request(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
