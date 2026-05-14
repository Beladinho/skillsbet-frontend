const STORAGE_KEY = "skillsbet_creator_games";

function loadGames() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveGames(games) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

function generateId() {
  return `game_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function submitCreatorGame({ creator_id, name, description, category, code, screenshot }) {
  const games = loadGames();
  const newGame = {
    id: generateId(),
    creator_id,
    name,
    description,
    category,
    code,
    screenshot: screenshot || null,
    status: "pending",
    rejection_reason: null,
    submitted_at: new Date().toISOString(),
    approved_at: null,
    free_until: null,
    plays: 0,
    revenue: 0,
    creator_revenue: 0,
  };
  games.push(newGame);
  saveGames(games);
  return newGame;
}

export function getCreatorGames(creator_id) {
  return loadGames().filter((g) => g.creator_id === creator_id);
}

export function getApprovedGames() {
  return loadGames().filter((g) => g.status === "approved");
}

export function getGameById(id) {
  return loadGames().find((g) => g.id === id) || null;
}

export function getAllGamesAdmin() {
  return loadGames();
}

export function approveGame(id) {
  const games = loadGames();
  const idx = games.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  const now = new Date();
  const freeUntil = new Date(now);
  freeUntil.setDate(freeUntil.getDate() + 7);
  games[idx] = {
    ...games[idx],
    status: "approved",
    approved_at: now.toISOString(),
    free_until: freeUntil.toISOString(),
    rejection_reason: null,
  };
  saveGames(games);
  return games[idx];
}

export function rejectGame(id, reason) {
  const games = loadGames();
  const idx = games.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  games[idx] = {
    ...games[idx],
    status: "rejected",
    rejection_reason: reason || "Non conforme aux règles.",
  };
  saveGames(games);
  return games[idx];
}

export function incrementPlays(id) {
  const games = loadGames();
  const idx = games.findIndex((g) => g.id === id);
  if (idx === -1) return;
  games[idx].plays = (games[idx].plays || 0) + 1;
  saveGames(games);
}
