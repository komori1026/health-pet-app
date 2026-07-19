const OWNER = "komori1026";
const REPO = "health-pet-data";
const PATH = "entries.json";
const TOKEN_KEY = "health_pet_github_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiRequest(options = {}) {
  const token = getToken();
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        ...(options.headers || {}),
      },
    }
  );
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`);
  }
  return res.json();
}

export async function fetchEntries() {
  const data = await apiRequest();
  const json = decodeURIComponent(escape(atob(data.content)));
  return { entries: JSON.parse(json), sha: data.sha };
}

export async function saveEntries(entries, sha) {
  const content = btoa(
    unescape(encodeURIComponent(JSON.stringify(entries, null, 2)))
  );
  return apiRequest({
    method: "PUT",
    body: JSON.stringify({
      message: `update entries ${new Date().toISOString()}`,
      content,
      sha,
    }),
  });
}
