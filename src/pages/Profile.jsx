import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../api/profileApi";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

export default function Profile() {
  const { tr } = useAppSettings();
  const { notifySuccess, notifyError } = useNotifications();
  const { playClick } = useSounds();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    display_name: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setError("");
        const data = await getProfile();
        setProfile(data);
        setForm({
          display_name: data.display_name ?? "",
          bio: data.bio ?? "",
        });
      } catch (err) {
        console.error(err);
        const msg = err.message || "Failed to load profile";
        setError(msg);
        notifyError("Erreur profil", msg);
      }
    }

    loadProfile();
  }, [notifyError]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setStatus("");

      const updated = await updateProfile({
        display_name: form.display_name,
        bio: form.bio,
      });

      setProfile(updated);
      setForm({
        display_name: updated.display_name ?? "",
        bio: updated.bio ?? "",
      });

      setStatus("saved");
      notifySuccess("Profil sauvegardé", "Les informations du profil ont été mises à jour.");
    } catch (err) {
      console.error(err);
      const msg = err.message || "Failed to save profile";
      setError(msg);
      notifyError("Erreur profil", msg);
    }
  }

  if (!profile && !error) {
    return (
      <div className="card" style={{ padding: 16, marginTop: 16 }}>
        <h2>{tr("userProfile")}</h2>
        <p>{tr("loading")}</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 16, marginTop: 16 }}>
      <h2>{tr("userProfile")}</h2>

      {error ? (
        <p style={{ color: "red" }}>
          {tr("error")} : {error}
        </p>
      ) : null}

      {profile ? (
        <>
          <p>
            <strong>{tr("email")} :</strong> {profile.email}
          </p>
          <p>
            <strong>{tr("role")} :</strong> {profile.role}
          </p>
          <p>
            <strong>{tr("balance")} :</strong> {profile.balance}
          </p>
          <p>
            <strong>Anti-cheat :</strong> {profile.risk_level || "clean"}
          </p>
          <p>
            <strong>{tr("globalElo")} :</strong> {profile.elo}
          </p>
          <p>
            <strong>{tr("wins")} :</strong> {profile.wins}
          </p>
          <p>
            <strong>{tr("losses")} :</strong> {profile.losses}
          </p>
          <p>
            <strong>{tr("gamesPlayed")} :</strong> {profile.games_played}
          </p>
        </>
      ) : null}

      {status === "saved" ? <p>✅ {tr("saveProfile")}</p> : null}

      <form
        onSubmit={(e) => {
          playClick();
          handleSubmit(e);
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <label>{tr("displayName")}</label>
          <br />
          <input
            type="text"
            name="display_name"
            value={form.display_name}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>{tr("bio")}</label>
          <br />
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <button type="submit">{tr("saveProfile")}</button>
      </form>
    </div>
  );
}
