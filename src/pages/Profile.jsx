import { useContext, useEffect, useState } from "react";
import { getProfile, updateProfile } from "../api/profileApi";
import { useAppSettings } from "../context/AppSettingsContext";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";
import { SORTED_COUNTRIES, getFlagByCode, getCountryNameByCode } from "../utils/countries";
import { PlayerContext } from "../context/PlayerContext";
import AvatarPicker from "../components/AvatarPicker";

export default function Profile() {
  const { tr } = useAppSettings();
  const { notifySuccess, notifyError } = useNotifications();
  const { playClick } = useSounds();
  const { setAvatarUrl } = useContext(PlayerContext);

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ display_name: "", bio: "", country: "", avatar_url: "" });
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
          country: data.country ?? "",
          avatar_url: data.avatar_url ?? "",
        });
        if (data.avatar_url) setAvatarUrl(data.avatar_url);
      } catch (err) {
        console.error(err);
        const msg = err.message || "Failed to load profile";
        setError(msg);
        notifyError("Erreur profil", msg);
      }
    }
    loadProfile();
  }, [notifyError, setAvatarUrl]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      setStatus("");
      const updated = await updateProfile({
        display_name: form.display_name,
        bio: form.bio,
        country: form.country || null,
        avatar_url: form.avatar_url || null,
      });
      setProfile(updated);
      const newAvatar = updated.avatar_url ?? "";
      setForm({
        display_name: updated.display_name ?? "",
        bio: updated.bio ?? "",
        country: updated.country ?? "",
        avatar_url: newAvatar,
      });
      setAvatarUrl(newAvatar);
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
      <div className="section-card" style={{ marginTop: 16 }}>
        <h2>{tr("userProfile")}</h2>
        <p>{tr("loading")}</p>
      </div>
    );
  }

  const countryFlag = profile?.country ? getFlagByCode(profile.country) : null;
  const countryName = profile?.country ? getCountryNameByCode(profile.country) : null;

  return (
    <div className="section-card" style={{ marginTop: 16 }}>
      <h2 style={{ fontFamily: "var(--font-heading)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {tr("userProfile")}
      </h2>

      {error ? (
        <p style={{ color: "var(--clr-error)" }}>{tr("error")} : {error}</p>
      ) : null}

      {profile ? (
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-box">
            <strong>{tr("email")}</strong>
            {profile.email}
          </div>
          <div className="stat-box">
            <strong>{tr("role")}</strong>
            {profile.role}
          </div>
          <div className="stat-box">
            <strong>{tr("balance")}</strong>
            {profile.balance} {tr("tokens")}
          </div>
          <div className="stat-box">
            <strong>{tr("globalElo")}</strong>
            {profile.elo}
          </div>
          <div className="stat-box">
            <strong>{tr("wins")}</strong>
            {profile.wins}
          </div>
          <div className="stat-box">
            <strong>{tr("losses")}</strong>
            {profile.losses}
          </div>
          <div className="stat-box">
            <strong>{tr("gamesPlayed")}</strong>
            {profile.games_played}
          </div>
          {countryName && (
            <div className="stat-box">
              <strong>{tr("country")}</strong>
              <span style={{ fontSize: "1.1rem" }}>{countryFlag} {countryName}</span>
            </div>
          )}
        </div>
      ) : null}

      {status === "saved" ? (
        <p style={{ color: "var(--clr-success)", marginBottom: 12 }}>
          ✓ {tr("saveProfile")}
        </p>
      ) : null}

      <form
        onSubmit={(e) => {
          playClick();
          handleSubmit(e);
        }}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        <div className="section-card" style={{ padding: 16 }}>
          <AvatarPicker
            value={form.avatar_url}
            onChange={(val) => setForm((prev) => ({ ...prev, avatar_url: val }))}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, color: "var(--clr-text-dim)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {tr("displayName")}
          </label>
          <input
            type="text"
            name="display_name"
            value={form.display_name}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, color: "var(--clr-text-dim)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {tr("bio")}
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: 6, color: "var(--clr-text-dim)", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {tr("country")}
          </label>
          <select
            name="country"
            value={form.country}
            onChange={handleChange}
            style={{ width: "100%" }}
          >
            <option value="">{tr("chooseCountry")}</option>
            {SORTED_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" style={{ alignSelf: "flex-start" }}>
          {tr("saveProfile")}
        </button>
      </form>
    </div>
  );
}
