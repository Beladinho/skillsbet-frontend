import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("🧠");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await apiFetch("/me");
      setProfile(data);
      setBio(data.bio || "");
      setAvatar(data.avatar || "🧠");
    } catch (err) {
      console.error(err);
    }
  };

  const saveProfile = async () => {
    try {
      await apiFetch("/me", {
        method: "PUT",
        body: JSON.stringify({
          bio,
          avatar
        })
      });

      alert("Profil mis à jour");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde");
    }
  };

  if (!profile) {
    return <p>Chargement...</p>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>{avatar} {profile.username}</h1>

      <p>
        Niveau {profile.level} — {profile.xp} XP
      </p>

      <h3>Modifier le profil</h3>

      <input
        value={avatar}
        onChange={(e) => setAvatar(e.target.value)}
      />

      <br /><br />

      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <br /><br />

      <button onClick={saveProfile}>
        Sauvegarder
      </button>
    </div>
  );
}
