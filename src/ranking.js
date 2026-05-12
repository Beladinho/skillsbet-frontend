export const rankDefinitions = [
  {
    key: "bronze",
    label: "Bronze",
    min: 0,
    max: 999,
    next: "silver",
  },
  {
    key: "silver",
    label: "Silver",
    min: 1000,
    max: 1199,
    next: "gold",
  },
  {
    key: "gold",
    label: "Gold",
    min: 1200,
    max: 1399,
    next: "platinum",
  },
  {
    key: "platinum",
    label: "Platinum",
    min: 1400,
    max: 1599,
    next: "diamond",
  },
  {
    key: "diamond",
    label: "Diamond",
    min: 1600,
    max: 1799,
    next: "master",
  },
  {
    key: "master",
    label: "Master",
    min: 1800,
    max: 2099,
    next: "grandmaster",
  },
  {
    key: "grandmaster",
    label: "Grandmaster",
    min: 2100,
    max: Infinity,
    next: null,
  },
];

export function getRankFromElo(elo) {
  const safeElo = Number(elo || 0);

  for (const rank of rankDefinitions) {
    if (safeElo >= rank.min && safeElo <= rank.max) {
      return rank;
    }
  }

  return rankDefinitions[0];
}

export function getRankProgress(elo) {
  const rank = getRankFromElo(elo);
  const safeElo = Number(elo || 0);

  if (rank.max === Infinity) {
    return 100;
  }

  const range = rank.max - rank.min + 1;
  const value = Math.max(0, safeElo - rank.min);
  return Math.max(0, Math.min(100, Math.round((value / range) * 100)));
}

export function getRankColor(rankKey) {
  const map = {
    bronze: "#b45309",
    silver: "#94a3b8",
    gold: "#eab308",
    platinum: "#22c55e",
    diamond: "#38bdf8",
    master: "#a855f7",
    grandmaster: "#ef4444",
  };

  return map[rankKey] || "#64748b";
}

export function isRankUnlocked(elo, rankKey) {
  const currentRank = getRankFromElo(elo);
  const currentIndex = rankDefinitions.findIndex((r) => r.key === currentRank.key);
  const targetIndex = rankDefinitions.findIndex((r) => r.key === rankKey);

  return targetIndex <= currentIndex;
}

export function isCurrentRank(elo, rankKey) {
  return getRankFromElo(elo).key === rankKey;
}