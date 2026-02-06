import { useEffect, useState } from "react";
import { api } from "../api";

export default function EventBanner() {
  const [event, setEvent] = useState(null);

  useEffect(() => {
    api.get("/events").then(res => setEvent(res.data));
  }, []);

  if (!event) return null;

  return <div>🎉 {event.name}</div>;
}
