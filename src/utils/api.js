const BASE = 'https://study-optimizer-backend.onrender.com';

// ── Subjects ──────────────────────────────
export async function fetchSubjects() {
  const res = await fetch(`${BASE}/subjects`);
  return res.json();
}

export async function addSubject(subject) {
  const res = await fetch(`${BASE}/subjects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subject),
  });
  return res.json();
}

export async function updateSubject(id, data) {
  const res = await fetch(`${BASE}/subjects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteSubject(id) {
  await fetch(`${BASE}/subjects/${id}`, { method: 'DELETE' });
}

// ── History ───────────────────────────────
export async function fetchHistory() {
  const res = await fetch(`${BASE}/history`);
  return res.json();
}

export async function saveHistory(run) {
  const res = await fetch(`${BASE}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(run),
  });
  return res.json();
}

export async function clearHistory() {
  await fetch(`${BASE}/history`, { method: 'DELETE' });
}