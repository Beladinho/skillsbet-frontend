export const rankRewards = {
  bronze: {
    tokens: 0,
    label: "0 jeton bonus",
  },
  silver: {
    tokens: 10,
    label: "10 jetons bonus",
  },
  gold: {
    tokens: 25,
    label: "25 jetons bonus",
  },
  platinum: {
    tokens: 50,
    label: "50 jetons bonus",
  },
  diamond: {
    tokens: 100,
    label: "100 jetons bonus",
  },
  master: {
    tokens: 200,
    label: "200 jetons bonus",
  },
  grandmaster: {
    tokens: 500,
    label: "500 jetons bonus",
  },
};

export function getRankReward(rankKey) {
  return rankRewards[rankKey] || rankRewards.bronze;
}