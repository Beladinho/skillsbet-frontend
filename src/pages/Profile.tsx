import { useEffect, useState } from "react"
import { apiFetch } from "../api"
import { useAuth } from "../context/AuthContext"

interface ProfileData {
  username: string
  xp: number
  level: number
  bio: string
  avatar: string
}

export default function Profile() {
  const { logout } = useAuth()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [bio, setBio] = useState("")
  const [avatar, setAvatar] = useState("")

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const data = await apiFetch("/me")
    setProfile(data)
    setBio(data.bio || "")
    setAvatar(data.avatar || "")
  }

  const saveProfile = async () => {
    await apiFetch("/me", {
      method: "PUT",
      body: JSON.stringify({ bio, avatar }),
    })
    alert("Profil mis à jour ✅")
    loadProfile()
  }

  if (!profile) return <p>Chargement du profil...</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>👤 Profil de {profile.username}</h1>
      <button onClick={logout}>Se déconnecter</button>

      <h2>🎖 Niveau {profile.level}</h2>
      <p>XP : {profile.xp}</p>

      <hr />

      <h3>🖼 Avatar (URL d'image)</h3>
      {avatar && (
        <img
          src={avatar}
          alt="avatar"
          style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover" }}
        />
      )}
      <input
        type="text"
        value={avatar}
        onChange={(e) => setAvatar(e.target.value)}
        placeholder="https://..."
        style={{ width: "100%", marginTop: 10 }}
      />

      <h3>📝 Bio</h3>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={4}
        style={{ width: "100%" }}
        placeholder="Parle de toi, de tes compétences, de tes objectifs..."
      />

      <br />
      <button onClick={saveProfile} style={{ marginTop: 10 }}>
        💾 Sauvegarder
      </button>
    </div>
  )
}

