import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useAppSettings } from "./AppSettingsContext";
import { useSounds } from "./SoundContext";

const NotificationContext = createContext(null);

let nextNotificationId = 1;

export function NotificationProvider({ children }) {
  const { settings } = useAppSettings();
  const { playSuccess, playError, playInfo } = useSounds();
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const pushNotification = useCallback(
    ({ type = "info", title = "", message = "", duration = 4000, silent = false }) => {
      if (settings?.notifications_enabled === false) {
        return;
      }

      const id = nextNotificationId++;
      const item = {
        id,
        type,
        title,
        message,
      };

      setNotifications((prev) => [item, ...prev]);

      if (!silent) {
        if (type === "success") playSuccess();
        else if (type === "error") playError();
        else playInfo();
      }

      if (duration > 0) {
        window.setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
      }
    },
    [settings?.notifications_enabled, playSuccess, playError, playInfo]
  );

  const notifySuccess = useCallback(
    (title, message = "") => {
      pushNotification({ type: "success", title, message });
    },
    [pushNotification]
  );

  const notifyError = useCallback(
    (title, message = "") => {
      pushNotification({ type: "error", title, message, duration: 5000 });
    },
    [pushNotification]
  );

  const notifyInfo = useCallback(
    (title, message = "") => {
      pushNotification({ type: "info", title, message });
    },
    [pushNotification]
  );

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      pushNotification,
      notifySuccess,
      notifyError,
      notifyInfo,
      removeNotification,
      clearNotifications,
      notificationsEnabled: settings?.notifications_enabled !== false,
    }),
    [
      notifications,
      pushNotification,
      notifySuccess,
      notifyError,
      notifyInfo,
      removeNotification,
      clearNotifications,
      settings?.notifications_enabled,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);

  if (!ctx) {
    throw new Error("useNotifications must be used inside NotificationProvider");
  }

  return ctx;
}