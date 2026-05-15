import { useRef } from "react";

const PRESET_AVATARS = [
  { id: "warrior",  label: "Guerrier", emoji: "⚔️" },
  { id: "ninja",    label: "Ninja",    emoji: "🥷" },
  { id: "robot",    label: "Robot",    emoji: "🤖" },
  { id: "alien",    label: "Alien",    emoji: "👽" },
  { id: "dragon",   label: "Dragon",   emoji: "🐲" },
  { id: "phoenix",  label: "Phénix",   emoji: "🌟" },
  { id: "wolf",     label: "Loup",     emoji: "🐺" },
  { id: "lion",     label: "Lion",     emoji: "🦁" },
  { id: "eagle",    label: "Aigle",    emoji: "🦅" },
  { id: "serpent",  label: "Serpent",  emoji: "🐍" },
  { id: "spectre",  label: "Spectre",  emoji: "👻" },
  { id: "titan",    label: "Titan",    emoji: "🗿" },
  { id: "shadow",   label: "Ombre",    emoji: "🌑" },
  { id: "flame",    label: "Flamme",   emoji: "🔥" },
  { id: "ice",      label: "Glace",    emoji: "❄️" },
  { id: "thunder",  label: "Tonnerre", emoji: "⚡" },
  { id: "cosmos",   label: "Cosmos",   emoji: "🌌" },
  { id: "neon",     label: "Néon",     emoji: "💜" },
  { id: "cyber",    label: "Cyber",    emoji: "🔮" },
  { id: "matrix",   label: "Matrix",   emoji: "💻" },
];

const MAX_IMAGE_SIZE = 200 * 1024; // 200 KB base64

export default function AvatarPicker({ value, onChange }) {
  const fileRef = useRef(null);

  function handlePreset(emoji) {
    onChange(emoji);
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      if (dataUrl.length > MAX_IMAGE_SIZE * 1.4) {
        resizeImage(dataUrl, 200, (resized) => onChange(resized));
      } else {
        onChange(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div>
      <label style={{
        display: "block",
        marginBottom: 12,
        color: "var(--clr-text-dim)",
        fontSize: "0.85rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}>
        Avatar
      </label>

      {/* Preview */}
      {value && (
        <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: value.startsWith("data:") ? "transparent" : "#1A1A1A",
            border: "2px solid var(--clr-orange)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: value.startsWith("data:") ? 0 : 32,
            overflow: "hidden",
            flexShrink: 0,
          }}>
            {value.startsWith("data:") ? (
              <img src={value} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
            ) : value}
          </div>
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => onChange("")}
            style={{ fontSize: "0.78rem" }}
          >
            ✕ Retirer
          </button>
        </div>
      )}

      {/* Preset grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 8,
        marginBottom: 14,
      }}>
        {PRESET_AVATARS.map((a) => {
          const isSelected = value === a.emoji;
          return (
            <button
              key={a.id}
              type="button"
              title={a.label}
              onClick={() => handlePreset(a.emoji)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "10px 6px",
                background: isSelected ? "rgba(255,107,0,0.2)" : "var(--clr-surface-2)",
                border: isSelected
                  ? "2px solid var(--clr-orange)"
                  : "2px solid transparent",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = "rgba(255,107,0,0.4)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = "transparent";
              }}
            >
              <span style={{ fontSize: 26, lineHeight: 1 }}>{a.emoji}</span>
              <span style={{
                fontSize: "0.62rem",
                color: isSelected ? "var(--clr-orange)" : "var(--clr-text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
              }}>
                {a.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Photo upload */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <button
        type="button"
        className="btn-ghost btn-sm"
        onClick={() => fileRef.current?.click()}
        style={{ fontSize: "0.82rem" }}
      >
        📷 Uploader une photo
      </button>
    </div>
  );
}

function resizeImage(dataUrl, maxSize, callback) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ratio = Math.min(maxSize / img.width, maxSize / img.height);
    canvas.width = img.width * ratio;
    canvas.height = img.height * ratio;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    callback(canvas.toDataURL("image/jpeg", 0.82));
  };
  img.src = dataUrl;
}
