const API = "https://worknow-backend.onrender.com";

/*
  Central fetch wrapper.
  Automatically attaches JWT if available.
*/
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Optional: handle auth failures globally
  if (response.status === 401 || response.status === 403) {
    throw new Error("Unauthorized");
  }

  return response;
}

/* ===========================
   PUBLIC (NO AUTH REQUIRED)
   =========================== */

export async function getJobs(city) {
  const url = city
    ? `${API}/gigs?city=${encodeURIComponent(city)}`
    : `${API}/gigs`;

  const r = await apiFetch(url);
  return r.json();
}

/* ===========================
   EMPLOYER (AUTH REQUIRED)
   =========================== */

export async function postJob(data) {
  const r = await apiFetch(`${API}/gigs`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(text || "Failed to post job");
  }

  // Guard against empty body
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}


export async function getMyJobs() {
  const r = await apiFetch(`${API}/manage/jobs`);
  return r.json();
}

export async function getCurrentApplicant(gigId) {
  const r = await apiFetch(
    `${API}/manage/gigs/${gigId}/current-applicant`
  );
  return r.json();
}

export async function rejectApplicant(id) {
  await apiFetch(`${API}/manage/applications/${id}/reject`, {
    method: "POST",
  });
}

export async function hireApplicant(id) {
  await apiFetch(`${API}/manage/applications/${id}/hire`, {
    method: "POST",
  });
}

/* ===========================
   WORKER (AUTH REQUIRED)
   =========================== */

export async function applyJob(gigId, note) {
  const r = await apiFetch(`${API}/apply/${gigId}`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
  return r.text();
}

/* ===========================
   USER PROFILE
   =========================== */

export async function getProfile() {
  const r = await apiFetch(`${API}/me`);
  if (!r.ok) {
    throw new Error("Failed to fetch profile");
  }
  return r.json();
}

/* ===========================
   PORTFOLIO VIDEO
   =========================== */

export async function uploadPortfolioVideo(videoFile) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("video", videoFile);

  const response = await fetch(`${API}/portfolio/video`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Unauthorized");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to upload video");
  }
  return data;
}

export async function getPortfolioVideo() {
  const r = await apiFetch(`${API}/portfolio/video`);
  if (!r.ok) {
    throw new Error("Failed to fetch video");
  }
  return r.json();
}

export async function deletePortfolioVideo() {
  const r = await apiFetch(`${API}/portfolio/video`, {
    method: "DELETE",
  });

  const data = await r.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to delete video");
  }
  return data;
}

/* ===========================
   GIG VIDEO
   =========================== */

export async function uploadGigVideo(gigId, videoFile) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("video", videoFile);

  const response = await fetch(`${API}/gigs/${gigId}/video`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("Unauthorized");
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to upload video");
  }
  return data;
}

export async function deleteGigVideo(gigId) {
  const r = await apiFetch(`${API}/gigs/${gigId}/video`, {
    method: "DELETE",
  });

  const data = await r.json();
  if (!data.success) {
    throw new Error(data.message || "Failed to delete video");
  }
  return data;
}
