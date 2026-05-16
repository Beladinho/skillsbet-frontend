import { useState } from "react";
import ReportModal from "./ReportModal";

export default function ReportButton({ targetId, style = {} }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={`Signaler ${targetId}`}
        style={{
          background: "none",
          border: "1px solid rgba(248,113,113,0.3)",
          borderRadius: 6,
          color: "#f87171",
          cursor: "pointer",
          fontSize: "0.78rem",
          padding: "2px 7px",
          lineHeight: 1.5,
          transition: "background 0.12s, border-color 0.12s",
          ...style,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(248,113,113,0.12)";
          e.currentTarget.style.borderColor = "rgba(248,113,113,0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "none";
          e.currentTarget.style.borderColor = "rgba(248,113,113,0.3)";
        }}
      >
        🚩
      </button>
      {open && <ReportModal targetId={targetId} onClose={() => setOpen(false)} />}
    </>
  );
}
