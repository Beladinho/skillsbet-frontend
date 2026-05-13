import { useAppSettings } from "../context/AppSettingsContext";
import { rankLabel } from "../i18n";
import { getRankColor } from "../ranking";

export default function RankBadge({ rankKey }) {
  const { settings } = useAppSettings();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: "3px",
        fontFamily: "var(--font-heading)",
        fontSize: "0.7rem",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        background: getRankColor(rankKey),
        color: "#fff",
        boxShadow: `0 0 8px ${getRankColor(rankKey)}55`,
      }}
    >
      {rankLabel(settings.language, rankKey)}
    </span>
  );
}
