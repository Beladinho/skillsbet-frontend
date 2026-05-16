import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { useAppSettings } from "../context/AppSettingsContext";
import {
  connectToSpectatorSocket,
  disconnectSpectatorSocket,
  sendSpectatorMessage,
} from "../api/socket";
import { getActiveDuels } from "../api/skillsbetApi";
import { gameLabel } from "../i18n";

export default function Spectate() {
  const { duel_id } = useParams();
  const navigate = useNavigate();
  const { playerId } = useContext(PlayerContext);
  const { tr, settings } = useAppSettings();

  const [duelInfo, setDuelInfo] = useState(null);
  const [scores, setScores] = useState({});
  const [spectatorCount, setSpectatorCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [status, setStatus] = useState("connecting");
  const [duelFinished, setDuelFinished] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    getActiveDuels()
      .then((duels) => {
        const found = (duels || []).find((d) => d.duel_id === duel_id);
        if (found) setDuelInfo(found);
      })
      .catch(() => {});
  }, [duel_id]);

  const handleMessage = useCallback((data) => {
    switch (data.type) {
      case "connected":
        setStatus("connected");
        setSpectatorCount(data.spectator_count ?? 0);
        break;
      case "score_update":
        setScores(data.scores ?? {});
        break;
      case "spectator_count":
        setSpectatorCount(data.count ?? 0);
        break;
      case "spectator_chat":
        setChatMessages((prev) => [
          ...prev,
          { player_id: data.player_id, message: data.message },
        ]);
        break;
      case "duel_finished":
        setDuelFinished(true);
        setStatus("finished");
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    if (!playerId || !duel_id) return;

    connectToSpectatorSocket(
      duel_id,
      playerId,
      handleMessage,
      () => setStatus("connected"),
      () => setStatus("disconnected")
    );

    return () => {
      disconnectSpectatorSocket();
    };
  }, [duel_id, playerId, handleMessage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  function handleSendChat() {
    const msg = chatInput.trim();
    if (!msg) return;
    sendSpectatorMessage({ type: "spectator_chat", message: msg });
    setChatInput("");
  }

  function handleChatKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendChat();
    }
  }

  const gameName = duelInfo
    ? gameLabel(settings.language, duelInfo.game)
    : duel_id;

  const p1 = duelInfo?.player1 ?? "Joueur 1";
  const p2 = duelInfo?.player2 ?? "Joueur 2";
  const score1 = scores[p1] ?? scores[duelInfo?.player1] ?? "-";
  const score2 = scores[p2] ?? scores[duelInfo?.player2] ?? "-";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--clr-bg)",
        color: "var(--clr-text)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.3rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: "var(--clr-orange)",
            }}
          >
            👁 Mode Spectateur
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--clr-text-muted)", marginTop: 4 }}>
            {gameName}
            {duelInfo && (
              <span style={{ marginLeft: 8, color: "var(--clr-text-dim)" }}>
                · Mise : <strong style={{ color: "var(--clr-orange)" }}>{duelInfo.stake} pts</strong>
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => { disconnectSpectatorSocket(); navigate("/lobby"); }}
          style={{
            padding: "8px 18px",
            background: "rgba(255,107,0,0.08)",
            border: "1px solid rgba(255,107,0,0.3)",
            color: "var(--clr-orange)",
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: 1,
            cursor: "pointer",
            borderRadius: 6,
          }}
        >
          ✕ Quitter
        </button>
      </div>

      {/* Status bar */}
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 20,
          padding: "8px 14px",
          background: "var(--clr-surface-1)",
          border: "1px solid var(--clr-border)",
          borderRadius: 8,
          fontSize: "0.78rem",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background:
              status === "connected"
                ? "#22c55e"
                : status === "finished"
                ? "var(--clr-orange)"
                : "#666",
            flexShrink: 0,
          }}
        />
        <span style={{ color: "var(--clr-text-muted)" }}>
          {status === "connecting" && "Connexion en cours…"}
          {status === "connected" && !duelFinished && "En direct"}
          {status === "disconnected" && "Déconnecté"}
          {duelFinished && "Duel terminé"}
        </span>
        <span style={{ marginLeft: "auto", color: "var(--clr-text-muted)" }}>
          👁 {spectatorCount} spectateur{spectatorCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Scoreboard */}
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
          padding: "24px 20px",
          background: "var(--clr-surface-1)",
          border: "1px solid var(--clr-border)",
          borderRadius: 12,
        }}
      >
        {/* Player 1 */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "#fff",
              marginBottom: 8,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {p1}
          </div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "3rem",
              fontWeight: 900,
              color: "var(--clr-orange)",
              lineHeight: 1,
            }}
          >
            {score1}
          </div>
        </div>

        {/* VS */}
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.2rem",
            fontWeight: 900,
            color: "var(--clr-text-muted)",
            textAlign: "center",
          }}
        >
          VS
        </div>

        {/* Player 2 */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: "#fff",
              marginBottom: 8,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {p2}
          </div>
          <div
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "3rem",
              fontWeight: 900,
              color: "var(--clr-orange)",
              lineHeight: 1,
            }}
          >
            {score2}
          </div>
        </div>
      </div>

      {/* Spectator Chat */}
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          background: "var(--clr-surface-1)",
          border: "1px solid var(--clr-border)",
          borderRadius: 12,
          overflow: "hidden",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "10px 16px",
            borderBottom: "1px solid var(--clr-border)",
            fontFamily: "var(--font-heading)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: 1,
            color: "var(--clr-text-muted)",
          }}
        >
          💬 Chat Spectateurs
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            maxHeight: 260,
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {chatMessages.length === 0 ? (
            <p
              style={{
                color: "var(--clr-text-muted)",
                fontSize: "0.8rem",
                textAlign: "center",
                padding: "24px 0",
              }}
            >
              Aucun message — soyez le premier à écrire !
            </p>
          ) : (
            chatMessages.map((msg, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span
                  style={{
                    fontWeight: 700,
                    color: "var(--clr-orange)",
                    fontSize: "0.8rem",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {msg.player_id === playerId ? "Vous" : msg.player_id}
                </span>
                <span style={{ fontSize: "0.85rem", color: "var(--clr-text)", wordBreak: "break-word" }}>
                  {msg.message}
                </span>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "10px 12px",
            borderTop: "1px solid var(--clr-border)",
          }}
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleChatKeyDown}
            placeholder="Votre message…"
            maxLength={200}
            disabled={status !== "connected"}
            style={{
              flex: 1,
              padding: "8px 12px",
              background: "var(--clr-surface-2)",
              border: "1px solid var(--clr-border-bright)",
              borderRadius: 6,
              color: "var(--clr-text)",
              fontSize: "0.85rem",
            }}
          />
          <button
            onClick={handleSendChat}
            disabled={!chatInput.trim() || status !== "connected"}
            style={{
              padding: "8px 16px",
              background: "var(--clr-orange)",
              color: "#000",
              border: "none",
              borderRadius: 6,
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: "0.8rem",
              cursor: "pointer",
              opacity: !chatInput.trim() || status !== "connected" ? 0.5 : 1,
            }}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
