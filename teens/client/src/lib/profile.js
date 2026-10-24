/**
 * Onboarding preferences (nickname, age group, goals) stay on this device
 * only — they are never sent to the server.
 */
const KEY = 'femaware.profile.v1';

export function loadProfile() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // Storage may be unavailable (private mode); onboarding still works.
  }
}

export function clearProfile() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
