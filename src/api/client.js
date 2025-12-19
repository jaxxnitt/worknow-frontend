const API = "https://worknow-backend.onrender.com";

export async function getJobs(city) {
  const url = city ? `${API}/gigs?city=${encodeURIComponent(city)}` : `${API}/gigs`;
  const r = await fetch(url);
  return r.json();
}

export async function postJob(data) {
  const r = await fetch(`${API}/gigs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return r.json();
}

export async function applyJob(gigId, payload) {
  const r = await fetch(`${API}/apply/${gigId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return r.text();
}

export async function getMyJobs(posterName) {
  const r = await fetch(
    `${API}/manage/jobs?posterName=${encodeURIComponent(posterName)}`
  );
  return r.json();
}

export async function getCurrentApplicant(gigId) {
  const r = await fetch(`${API}/manage/gigs/${gigId}/current-applicant`);
  return r.json();
}

export async function rejectApplicant(id) {
  await fetch(`${API}/applications/${id}/reject`, { method: "POST" });
}

export async function hireApplicant(id) {
  await fetch(`${API}/applications/${id}/hire`, { method: "POST" });
}
