import { useEffect, useRef, useState } from "react";
import { containsBannedWord } from "../utils/chatFilter";
import { moderateWithAI } from "../api/chatModeration";
import { sendDuelSocketMessage } from "../api/socket";
import { useSounds } from "../context/SoundContext";
import PlayerAvatar from "./PlayerAvatar";

const EMOTES = [
  { label: "GG 👏",       message: "GG 👏" },
  { label: "Bien joué 🎯", message: "Bien joué 🎯" },
  { label: "Pas mal 😅",  message: "Pas mal 😅" },
  { label: "Rematch 🔁",  message: "Rematch 🔁" },
  { label: "😤",           message: "😤" },
  { label: "🔥",           message: "🔥" },
  { label: "💀",           message: "💀" },
  { label: "😂",           message: "😂" },
];

const MAX_LEN = 200;

export default function DuelChat({ messages, playerId, onSendMessage, avatarUrls = {} }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const prevLenRef = useRef(messages.length);
  const { playInfo, playClick } = useSounds();

  useEffect(() => {
    const newCount = messages.length - prevLenRef.current;
    if (!open && newCount > 0) {
      setUnread((u) => u + newCount);
      playInfo();
    }
    prevLenRef.current = messages.length;
  }, [messages.length]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  async function handleSend(text, kind = "text") {
    const trimmed = text.trim().slice(0, MAX_LEN);
    if (!trimmed || checking) return;
    setError(null);

    if (kind === "text") {
      if (containsBannedWord(trimmed)) {
        setError("Message bloqué : contenu interdit.");
        return;
      }
      setChecking(true);
      try {
        const { blocked } = await moderateWithAI(trimmed);
        if (blocked) {
          setError("Message bloqué par la modération IA.");
          return;
        }
      } finally {
        setChecking(false);
      }
    }

    playClick();
    onSendMessage(trimmed, kind);
    setInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  }

  const isMe = (msg) => msg.player_id === playerId;

  return (
    <div style={{ marginTop: "12px" }}>
      {/* Toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          width: "100%",
          padding: "8px 14px",
          background: open
            ? "rgba(255,107,0,0.12)"
            : "rgba(255,107,0,0.06)",
          border: "1px solid rgba(255,107,0,0.3)",
          borderRadius: "var(--radius-md)",
          color: "var(--clr-orange)",
          fontFamily: "var(--font-heading)",
          fontWeight: 800,
          fontSize: "0.78rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          cursor: "pointer",
          justifyContent: "space-between",
          transition: "background 0.15s",
        }}
      >
        <span>💬 Chat</span>
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {unread > 0 && (
            <span
              style={{
                background: "#ef4444",
                color: "#fff",
                borderRadius: "9999px",
                fontSize: "0.68rem",
                fontWeight: 900,
                padding: "1px 6px",
                letterSpacing: 0,
                fontFamily: "sans-serif",
              }}
            >
              {unread}
            </span>
          )}
          <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>{open ? "▲" : "▼"}</span>
        </span>
      </button>

      {open && (
        <div
          style={{
            marginTop: "6px",
            background: "rgba(0,0,0,0.82)",
            border: "1px solid rgba(255,107,0,0.2)",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
          }}
        >
          {/* Messages */}
          <div
            style={{
              height: "180px",
              overflowY: "auto",
              padding: "10px 12px",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            {messages.length === 0 && (
              <p
                style={{
                  color: "rgba(255,255,255,0.25)",
                  fontSize: "0.78rem",
                  margin: "auto",
                  textAlign: "center",
                  fontStyle: "italic",
                }}
              >
                Aucun message — soyez le premier !
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "7px",
                  alignItems: "flex-start",
                }}
              >
                <PlayerAvatar
                  playerId={msg.player_id}
                  avatarUrl={avatarUrls[msg.player_id]}
                  size={22}
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <div style={{ display: "flex", gap: "5px", alignItems: "baseline", flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800,
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: isMe(msg) ? "var(--clr-orange)" : "#60a5fa",
                      flexShrink: 0,
                    }}
                  >
                    {isMe(msg) ? "Moi" : msg.player_id}
                  </span>
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: isMe(msg) ? "#ffd6a0" : "#bfdbfe",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.kind === "emote" ? (
                      <em style={{ opacity: 0.9 }}>{msg.message}</em>
                    ) : (
                      msg.message
                    )}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Emotes */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              padding: "8px 10px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              background: "rgba(0,0,0,0.3)",
            }}
          >
            {EMOTES.map((e) => (
              <button
                key={e.label}
                onClick={() => handleSend(e.message, "emote")}
                disabled={checking}
                style={{
                  padding: "4px 8px",
                  fontSize: "0.78rem",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: "#cbd5e1",
                  fontFamily: "sans-serif",
                  transition: "background 0.12s, border-color 0.12s",
                }}
                onMouseEnter={(el) => {
                  el.currentTarget.style.background = "rgba(255,107,0,0.12)";
                  el.currentTarget.style.borderColor = "rgba(255,107,0,0.4)";
                  el.currentTarget.style.color = "#fbbf24";
                }}
                onMouseLeave={(el) => {
                  el.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  el.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  el.currentTarget.style.color = "#cbd5e1";
                }}
              >
                {e.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            style={{
              padding: "8px 10px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            {error && (
              <p
                style={{
                  margin: 0,
                  fontSize: "0.74rem",
                  color: "#f87171",
                  fontWeight: 600,
                }}
              >
                ⚠ {error}
              </p>
            )}
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                value={input}
                onChange={(e) => {
                  setInput(e.target.value.slice(0, MAX_LEN));
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder={checking ? "Vérification…" : "Message…"}
                disabled={checking}
                maxLength={MAX_LEN}
                style={{
                  flex: 1,
                  padding: "7px 10px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "6px",
                  color: "#f8fafc",
                  fontSize: "0.82rem",
                  outline: "none",
                  fontFamily: "inherit",
                  caretColor: "var(--clr-orange)",
                }}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={checking || !input.trim()}
                style={{
                  padding: "7px 12px",
                  background: "rgba(255,107,0,0.15)",
                  border: "1px solid rgba(255,107,0,0.4)",
                  borderRadius: "6px",
                  color: checking ? "#888" : "var(--clr-orange)",
                  cursor: checking || !input.trim() ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  opacity: checking || !input.trim() ? 0.5 : 1,
                  transition: "opacity 0.15s",
                }}
              >
                {checking ? "…" : "↵"}
              </button>
            </div>
            {input.length > MAX_LEN * 0.8 && (
              <p style={{ margin: 0, fontSize: "0.68rem", color: "rgba(255,255,255,0.3)", textAlign: "right" }}>
                {input.length}/{MAX_LEN}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
