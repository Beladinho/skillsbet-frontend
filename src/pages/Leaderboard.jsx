import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLeaderboard, getCountryLeaderboard } from "../api/skillsbetApi";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNotifications } from "../context/NotificationContext";
import { PlayerContext } from "../context/PlayerContext";
import { useSocial } from "../context/SocialContext";
import { getFlagByCode, getCountryNameByCode } from "../utils/countries";
import PlayerAvatar from "../components/PlayerAvatar";

const GAMES = ["snake", "reflex", "memory", "tetris", "checkers", "chess", "uno", "lineup4", "xobattle"];

const GAME_LABELS = {
  snake: "Viper", reflex: "QuickShot", memory: "FlipMatch", tetris: "BlockDrop",
  checkers: "DraughtWar", chess: "KingSlayer", uno: "ColorBlitz", lineup4: "LineUp4", xobattle: "XO Battle",
};

function computeCountryLeaderboard(players) {
  const map = {};
  for (const p of players) {
    const code = p.country;
    if (!code) continue;
    if (!map[code]) map[code] = { code, totalElo: 0, wins: 0, count: 0 };
    map[code].totalElo += Number(p.elo ?? 0);
    map[code].wins += Number(p.wins ?? 0);
    map[code].count += 1;
  }
  return Object.values(map)
    .map((c) => ({ ...c, avgElo: Math.round(c.totalElo / c.count) }))
    .sort((a, b) => b.avgElo - a.avgElo);
}

export default function Leaderboard() {
  const { tr } = useAppSettings();
  const { playerId } = useContext(PlayerContext);
  const { notifySuccess, notifyError } = useNotifications();
  const { sendRequest } = useSocial();
  const [tab, setTab] = useState("players");
  const [selectedGame, setSelectedGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeaderboard(selectedGame);
  }, [selectedGame]);

  async function loadLeaderboard(game) {
    setLoading(true);
    try {
      const data = await getLeaderboard(game);
      const list = Array.isArray(data) ? data : [];
      const normalized = list.map((row) => ({
        ...row,
        player: row.player ?? row.username ?? row.name ?? "",
        elo:  row.elo  ?? row.display_elo  ?? 0,
        wins: row.wins ?? row.display_wins ?? 0,
      }));
      setPlayers(normalized);

      // Try dedicated endpoint first, fall back to computing from player data
      try {
        const countryData = await getCountryLeaderboard();
        setCountries(Array.isArray(countryData) ? countryData : computeCountryLeaderboard(list));
      } catch {
        setCountries(computeCountryLeaderboard(list));
      }
    } catch (error) {
      console.error("Erreur chargement leaderboard :", error);
      setPlayers([]);
      setCountries([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "0 0 40px 0" }}>
      <h2 style={{
        fontFamily: "var(--font-heading)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontSize: "1.8rem",
        marginBottom: "24px",
        color: "var(--clr-text)",
      }}>
        {tr("leaderboard")}
      </h2>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          className={tab === "players" ? "" : "btn-ghost"}
          onClick={() => setTab("players")}
          style={{ fontSize: "0.85rem" }}
        >
          {tr("playersTab")}
        </button>
        <button
          className={tab === "countries" ? "" : "btn-ghost"}
          onClick={() => setTab("countries")}
          style={{ fontSize: "0.85rem" }}
        >
          {tr("countriesTab")}
        </button>
      </div>

      {/* Game filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        <button
          className={selectedGame === null ? "" : "btn-ghost"}
          onClick={() => setSelectedGame(null)}
          style={{ fontSize: "0.78rem", padding: "4px 10px" }}
        >
          {tr("global")}
        </button>
        {GAMES.map((g) => (
          <button
            key={g}
            className={selectedGame === g ? "" : "btn-ghost"}
            onClick={() => setSelectedGame(g)}
            style={{ fontSize: "0.78rem", padding: "4px 10px" }}
          >
            {GAME_LABELS[g] || g}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "var(--clr-text-dim)" }}>{tr("loading")}</p>
      ) : tab === "players" ? (
        <PlayerLeaderboard
          players={players}
          tr={tr}
          currentPlayerId={playerId}
          onAddFriend={async (email) => {
            try {
              await sendRequest(email);
              notifySuccess("Demande envoyée", `Demande d'ami envoyée`);
            } catch (err) {
              notifyError("Erreur", err.message);
            }
          }}
        />
      ) : (
        <CountryLeaderboard countries={countries} tr={tr} />
      )}
    </div>
  );
}

function PlayerLeaderboard({ players, tr, currentPlayerId, onAddFriend }) {
  if (!players.length) {
    return <p style={{ color: "var(--clr-text-dim)" }}>{tr("empty")}</p>;
  }

  return (
    <div className="section-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--clr-surface-3)" }}>
              {["#", tr("players"), "NVX", tr("wins"), "ELO", ""].map((h) => (
                <th key={h} style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--clr-text-dim)",
                  fontWeight: 700,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((p, i) => {
              const flag = p.country ? getFlagByCode(p.country) : "";
              const isTop3 = i < 3;
              const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
              return (
                <tr
                  key={p.player ?? i}
                  style={{
                    borderBottom: "1px solid var(--clr-surface-2)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--clr-surface-2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 16px", width: 48 }}>
                    <span style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 900,
                      fontSize: "1rem",
                      color: isTop3 ? rankColors[i] : "var(--clr-text-dim)",
                    }}>
                      {i + 1}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <PlayerAvatar
                        playerId={p.player_id || p.player}
                        avatarUrl={p.avatar_url}
                        size={32}
                      />
                      <span style={{ fontSize: "0.9rem", marginRight: 4 }}>{flag}</span>
                      <Link
                        to={`/player/${encodeURIComponent(p.player)}`}
                        style={{ fontWeight: 600, color: "var(--clr-text)", textDecoration: "none" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "var(--clr-orange)"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "var(--clr-text)"}
                      >
                        {p.player}
                      </Link>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      background: "linear-gradient(135deg, #ff6b00, #ff9500)",
                      color: "#fff",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 900,
                      fontSize: "0.72rem",
                      padding: "2px 8px",
                      borderRadius: 4,
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                    }}>
                      {p.level ?? 1}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--clr-success)", fontWeight: 700 }}>
                    {p.wins}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ color: "var(--clr-orange)", fontWeight: 700 }}>{p.elo}</span>
                  </td>
                  <td style={{ padding: "8px 12px", textAlign: "right" }}>
                    {currentPlayerId && p.player !== currentPlayerId && (
                      <button
                        className="btn-ghost btn-sm leaderboard-add-friend"
                        onClick={() => onAddFriend(p.player)}
                        title="Ajouter en ami"
                      >
                        + Ami
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CountryLeaderboard({ countries, tr }) {
  if (!countries.length) {
    return (
      <p style={{ color: "var(--clr-text-dim)" }}>
        {tr("noCountryData")}
      </p>
    );
  }

  return (
    <div className="section-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--clr-surface-3)" }}>
              {["#", tr("country"), tr("totalWins"), tr("avgElo"), tr("players")].map((h) => (
                <th key={h} style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: "0.78rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--clr-text-dim)",
                  fontWeight: 700,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {countries.map((c, i) => {
              const flag = getFlagByCode(c.code);
              const name = getCountryNameByCode(c.code);
              const isTop3 = i < 3;
              const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];
              return (
                <tr
                  key={c.code}
                  style={{
                    borderBottom: "1px solid var(--clr-surface-2)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--clr-surface-2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 16px", width: 48 }}>
                    <span style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 900,
                      fontSize: "1rem",
                      color: isTop3 ? rankColors[i] : "var(--clr-text-dim)",
                    }}>
                      {i + 1}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: "1.3rem", marginRight: 10 }}>{flag}</span>
                    <span style={{ fontWeight: 600, color: "var(--clr-text)" }}>{name || c.code}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--clr-success)", fontWeight: 700 }}>
                    {c.wins ?? c.total_wins ?? 0}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ color: "var(--clr-orange)", fontWeight: 700 }}>
                      {c.avgElo ?? c.avg_elo ?? "—"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--clr-text-dim)" }}>
                    {c.count ?? c.player_count ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
