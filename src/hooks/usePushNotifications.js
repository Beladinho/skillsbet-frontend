import { useCallback, useEffect, useRef } from "react";

const VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function usePushNotifications() {
  const swRegRef = useRef(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        swRegRef.current = reg;
      })
      .catch(() => {});
  }, []);

  /* Request permission + subscribe (called once after login) */
  const requestPushPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") return;
    if (Notification.permission === "denied") return;

    await Notification.requestPermission();
  }, []);

  /* Subscribe to backend push (requires VITE_VAPID_PUBLIC_KEY) */
  const subscribeToPush = useCallback(async (playerId) => {
    if (!VAPID_KEY) return null;
    if (!swRegRef.current) return null;
    if (Notification.permission !== "granted") return null;

    try {
      const existing = await swRegRef.current.pushManager.getSubscription();
      if (existing) return existing;

      const subscription = await swRegRef.current.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
      });

      const apiUrl = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("skillsbet_token");
      if (apiUrl && token) {
        await fetch(`${apiUrl}/push/subscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ subscription, player_id: playerId }),
        }).catch(() => {});
      }

      return subscription;
    } catch {
      return null;
    }
  }, []);

  /* Show a local notification via the SW (works when tab is backgrounded) */
  const sendLocalPush = useCallback(async (title, body, url = "/lobby") => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const reg = swRegRef.current || (await navigator.serviceWorker.ready.catch(() => null));
    if (!reg) return;

    reg.showNotification(title, {
      body,
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url },
      vibrate: [150, 80, 150],
      tag: "skillsbet-local",
    });
  }, []);

  return { requestPushPermission, subscribeToPush, sendLocalPush };
}
