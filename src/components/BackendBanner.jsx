import { useEffect, useState } from "react";

export default function BackendBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleOffline() {
      setVisible(true);
    }
    function handleOnline() {
      setVisible(false);
    }
    function handleBackendError() {
      setVisible(true);
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    window.addEventListener("skillsbet:backend-down", handleBackendError);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("skillsbet:backend-down", handleBackendError);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="backend-banner" role="alert">
      <span>⚠ Serveur inaccessible — Vérifiez votre connexion ou réessayez dans un instant.</span>
      <button
        className="backend-banner__close"
        onClick={() => setVisible(false)}
        aria-label="Fermer"
      >
        ✕
      </button>
    </div>
  );
}
