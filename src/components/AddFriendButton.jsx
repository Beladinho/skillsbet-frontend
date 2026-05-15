import { useState } from "react";
import { useSocial } from "../context/SocialContext";
import { useNotifications } from "../context/NotificationContext";

export default function AddFriendButton({ targetId, className = "btn-ghost btn-sm", style = {} }) {
  const { sendRequest } = useSocial();
  const { notifySuccess, notifyError } = useNotifications();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (sent) {
    return <span className="badge-muted" style={style}>Demande envoyée</span>;
  }

  async function handle() {
    setLoading(true);
    try {
      await sendRequest(targetId);
      setSent(true);
      notifySuccess("Demande envoyée", `Demande d'ami envoyée`);
    } catch (err) {
      notifyError("Erreur", err.message);
    }
    setLoading(false);
  }

  return (
    <button className={className} onClick={handle} disabled={loading} style={style}>
      {loading ? "…" : "+ Ajouter en ami"}
    </button>
  );
}
