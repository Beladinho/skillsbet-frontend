const BLACKLIST_FR = [
  "merde", "putain", "connard", "conasse", "encule", "salope",
  "pute", "fdp", "ntm", "va te faire", "fils de pute", "batard",
  "nique", "niquer", "ta gueule", "tg", "pd", "tapette", "couille",
  "bite", "chier", "chieur", "branleur", "branlette", "zob", "teub",
  "kont", "conne", "salopard",
];

const BLACKLIST_EN = [
  "fuck", "fucker", "fucking", "motherfucker", "shit", "bullshit",
  "bitch", "asshole", "cunt", "nigger", "nigga", "faggot", "retard",
  "whore", "slut", "bastard", "dickhead", "cock", "pussy", "prick",
  "wanker", "tosser", "twat",
];

const SPAM_PATTERNS = [
  /https?:\/\//i,
  /www\./i,
  /(.)\1{7,}/,
];

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[4@]/g, "a")
    .replace(/3/g, "e")
    .replace(/[1!]/g, "i")
    .replace(/0/g, "o")
    .replace(/5/g, "s");
}

export function containsBannedWord(text) {
  if (!text || typeof text !== "string") return false;

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(text)) return true;
  }

  const normalized = normalize(text);

  for (const word of [...BLACKLIST_FR, ...BLACKLIST_EN]) {
    const normalizedWord = normalize(word);
    const escaped = normalizedWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(?:^|[^a-z])${escaped}(?:[^a-z]|$)`, "i");
    if (re.test(normalized)) return true;
  }

  return false;
}
