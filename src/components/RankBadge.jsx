import { useAppSettings } from "../context/AppSettingsContext";
import { rankLabel } from "../i18n";
import { getRankColor } from "../ranking";

export default function RankBadge({ rankKey }) {
  const { settings } = useAppSettings();

  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 700,
        background: getRankColor(rankKey),
        color: "white",
      }}
    >
      {rankLabel(settings.language, rankKey)}
    </span>
  );
}