export const COUNTRIES = [
  // Europe
  { code: "FR", name: "France",              flag: "🇫🇷", region: "Europe" },
  { code: "DE", name: "Allemagne",           flag: "🇩🇪", region: "Europe" },
  { code: "GB", name: "Royaume-Uni",         flag: "🇬🇧", region: "Europe" },
  { code: "IT", name: "Italie",              flag: "🇮🇹", region: "Europe" },
  { code: "ES", name: "Espagne",             flag: "🇪🇸", region: "Europe" },
  { code: "PT", name: "Portugal",            flag: "🇵🇹", region: "Europe" },
  { code: "NL", name: "Pays-Bas",            flag: "🇳🇱", region: "Europe" },
  { code: "BE", name: "Belgique",            flag: "🇧🇪", region: "Europe" },
  { code: "CH", name: "Suisse",              flag: "🇨🇭", region: "Europe" },
  { code: "AT", name: "Autriche",            flag: "🇦🇹", region: "Europe" },
  { code: "SE", name: "Suède",               flag: "🇸🇪", region: "Europe" },
  { code: "NO", name: "Norvège",             flag: "🇳🇴", region: "Europe" },
  { code: "DK", name: "Danemark",            flag: "🇩🇰", region: "Europe" },
  { code: "FI", name: "Finlande",            flag: "🇫🇮", region: "Europe" },
  { code: "PL", name: "Pologne",             flag: "🇵🇱", region: "Europe" },
  { code: "RU", name: "Russie",              flag: "🇷🇺", region: "Europe" },
  { code: "UA", name: "Ukraine",             flag: "🇺🇦", region: "Europe" },
  { code: "RO", name: "Roumanie",            flag: "🇷🇴", region: "Europe" },
  { code: "GR", name: "Grèce",              flag: "🇬🇷", region: "Europe" },
  { code: "IE", name: "Irlande",             flag: "🇮🇪", region: "Europe" },
  { code: "LU", name: "Luxembourg",          flag: "🇱🇺", region: "Europe" },
  { code: "CZ", name: "Tchéquie",           flag: "🇨🇿", region: "Europe" },
  { code: "HU", name: "Hongrie",             flag: "🇭🇺", region: "Europe" },
  { code: "HR", name: "Croatie",             flag: "🇭🇷", region: "Europe" },
  { code: "RS", name: "Serbie",              flag: "🇷🇸", region: "Europe" },
  // Americas
  { code: "US", name: "États-Unis",          flag: "🇺🇸", region: "Americas" },
  { code: "CA", name: "Canada",              flag: "🇨🇦", region: "Americas" },
  { code: "MX", name: "Mexique",             flag: "🇲🇽", region: "Americas" },
  { code: "BR", name: "Brésil",             flag: "🇧🇷", region: "Americas" },
  { code: "AR", name: "Argentine",           flag: "🇦🇷", region: "Americas" },
  { code: "CO", name: "Colombie",            flag: "🇨🇴", region: "Americas" },
  { code: "CL", name: "Chili",              flag: "🇨🇱", region: "Americas" },
  { code: "PE", name: "Pérou",              flag: "🇵🇪", region: "Americas" },
  { code: "VE", name: "Venezuela",           flag: "🇻🇪", region: "Americas" },
  { code: "EC", name: "Équateur",           flag: "🇪🇨", region: "Americas" },
  { code: "UY", name: "Uruguay",             flag: "🇺🇾", region: "Americas" },
  { code: "BO", name: "Bolivie",             flag: "🇧🇴", region: "Americas" },
  // Asia-Pacific
  { code: "CN", name: "Chine",              flag: "🇨🇳", region: "Asia-Pacific" },
  { code: "JP", name: "Japon",              flag: "🇯🇵", region: "Asia-Pacific" },
  { code: "KR", name: "Corée du Sud",       flag: "🇰🇷", region: "Asia-Pacific" },
  { code: "IN", name: "Inde",               flag: "🇮🇳", region: "Asia-Pacific" },
  { code: "AU", name: "Australie",           flag: "🇦🇺", region: "Asia-Pacific" },
  { code: "NZ", name: "Nouvelle-Zélande",  flag: "🇳🇿", region: "Asia-Pacific" },
  { code: "SG", name: "Singapour",           flag: "🇸🇬", region: "Asia-Pacific" },
  { code: "TH", name: "Thaïlande",          flag: "🇹🇭", region: "Asia-Pacific" },
  { code: "ID", name: "Indonésie",          flag: "🇮🇩", region: "Asia-Pacific" },
  { code: "MY", name: "Malaisie",            flag: "🇲🇾", region: "Asia-Pacific" },
  { code: "PH", name: "Philippines",         flag: "🇵🇭", region: "Asia-Pacific" },
  { code: "VN", name: "Vietnam",             flag: "🇻🇳", region: "Asia-Pacific" },
  { code: "PK", name: "Pakistan",            flag: "🇵🇰", region: "Asia-Pacific" },
  { code: "BD", name: "Bangladesh",          flag: "🇧🇩", region: "Asia-Pacific" },
  { code: "LK", name: "Sri Lanka",           flag: "🇱🇰", region: "Asia-Pacific" },
  { code: "NP", name: "Népal",              flag: "🇳🇵", region: "Asia-Pacific" },
  { code: "HK", name: "Hong Kong",           flag: "🇭🇰", region: "Asia-Pacific" },
  { code: "TW", name: "Taïwan",             flag: "🇹🇼", region: "Asia-Pacific" },
  // Africa
  { code: "ZA", name: "Afrique du Sud",      flag: "🇿🇦", region: "Africa" },
  { code: "NG", name: "Nigeria",             flag: "🇳🇬", region: "Africa" },
  { code: "EG", name: "Égypte",             flag: "🇪🇬", region: "Africa" },
  { code: "KE", name: "Kenya",              flag: "🇰🇪", region: "Africa" },
  { code: "MA", name: "Maroc",              flag: "🇲🇦", region: "Africa" },
  { code: "GH", name: "Ghana",              flag: "🇬🇭", region: "Africa" },
  { code: "TN", name: "Tunisie",             flag: "🇹🇳", region: "Africa" },
  { code: "DZ", name: "Algérie",            flag: "🇩🇿", region: "Africa" },
  { code: "CM", name: "Cameroun",            flag: "🇨🇲", region: "Africa" },
  { code: "CI", name: "Côte d'Ivoire",      flag: "🇨🇮", region: "Africa" },
  { code: "SN", name: "Sénégal",            flag: "🇸🇳", region: "Africa" },
  { code: "ET", name: "Éthiopie",           flag: "🇪🇹", region: "Africa" },
  { code: "TZ", name: "Tanzanie",            flag: "🇹🇿", region: "Africa" },
  // Middle East
  { code: "TR", name: "Turquie",             flag: "🇹🇷", region: "Middle East" },
  { code: "AE", name: "Émirats arabes unis", flag: "🇦🇪", region: "Middle East" },
  { code: "SA", name: "Arabie Saoudite",     flag: "🇸🇦", region: "Middle East" },
  { code: "IL", name: "Israël",             flag: "🇮🇱", region: "Middle East" },
  { code: "IR", name: "Iran",               flag: "🇮🇷", region: "Middle East" },
  { code: "IQ", name: "Irak",              flag: "🇮🇶", region: "Middle East" },
  { code: "QA", name: "Qatar",              flag: "🇶🇦", region: "Middle East" },
  { code: "KW", name: "Koweït",            flag: "🇰🇼", region: "Middle East" },
  { code: "JO", name: "Jordanie",            flag: "🇯🇴", region: "Middle East" },
  { code: "LB", name: "Liban",              flag: "🇱🇧", region: "Middle East" },
];

export function getCountryByCode(code) {
  if (!code) return null;
  return COUNTRIES.find((c) => c.code === code.toUpperCase()) || null;
}

export function getFlagByCode(code) {
  return getCountryByCode(code)?.flag || "";
}

export function getCountryNameByCode(code) {
  return getCountryByCode(code)?.name || code || "";
}

export function getRegionByCode(code) {
  return getCountryByCode(code)?.region || null;
}

export const SORTED_COUNTRIES = [...COUNTRIES].sort((a, b) =>
  a.name.localeCompare(b.name, "fr")
);
