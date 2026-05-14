import { useContext, useEffect, useState } from "react";
import {
  getAdminUsers,
  adminSetBalance,
  adminSetRole,
  adminResetPlayer,
  adminSetElo,
} from "../api/skillsbetApi";
import { PlayerContext } from "../context/PlayerContext";
import { useNotifications } from "../context/NotificationContext";
import { useSounds } from "../context/SoundContext";

export default function AdminUsersPanel() {
  const { role } = useContext(PlayerContext);
  const { notifyError, notifySuccess } = useNotifications();
  const { playClick } = useSounds();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingUser, setEditingUser] = useState("");
  const [newBalance, setNewBalance] = useState("");

  const [roleUser, setRoleUser] = useState("");
  const [newRole, setNewRole] = useState("user");

  const [resetUser, setResetUser] = useState("");

  const [eloUser, setEloUser] = useState("");
  const [eloGame, setEloGame] = useState("global");
  const [eloValue, setEloValue] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      notifyError("Admin users", error.message || "Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (role === "admin") {
      loadUsers();
    }
  }, [role]);

  async function handleSetBalance() {
    try {
      if (!editingUser) {
        notifyError("Admin balance", "Aucun joueur sélectionné.");
        return;
      }

      playClick();

      const result = await adminSetBalance(editingUser, Number(newBalance));
      notifySuccess("Admin balance", result.message || "Balance mise à jour.");
      setEditingUser("");
      setNewBalance("");
      await loadUsers();
    } catch (error) {
      console.error(error);
      notifyError("Admin balance", error.message || "Impossible de modifier la balance.");
    }
  }

  async function handleSetRole() {
    try {
      if (!roleUser) {
        notifyError("Admin role", "Aucun joueur sélectionné.");
        return;
      }

      playClick();

      const result = await adminSetRole(roleUser, newRole);
      notifySuccess("Admin role", result.message || "Rôle mis à jour.");
      setRoleUser("");
      setNewRole("user");
      await loadUsers();
    } catch (error) {
      console.error(error);
      notifyError("Admin role", error.message || "Impossible de modifier le rôle.");
    }
  }

  async function handleResetPlayer() {
    try {
      if (!resetUser) {
        notifyError("Admin reset", "Aucun joueur sélectionné.");
        return;
      }

      playClick();

      const result = await adminResetPlayer(resetUser);
      notifySuccess("Admin reset", result.message || "Joueur réinitialisé.");
      setResetUser("");
      await loadUsers();
    } catch (error) {
      console.error(error);
      notifyError("Admin reset", error.message || "Impossible de réinitialiser le joueur.");
    }
  }

  async function handleSetElo() {
    try {
      if (!eloUser) {
        notifyError("Admin elo", "Aucun joueur sélectionné.");
        return;
      }

      playClick();

      await adminSetElo(eloUser, eloGame, Number(eloValue));
      notifySuccess("Admin elo", "ELO mis à jour.");

      setEloUser("");
      setEloValue("");
      setEloGame("global");

      await loadUsers();
    } catch (error) {
      console.error(error);
      notifyError("Admin elo", error.message || "Impossible de modifier l’ELO.");
    }
  }

  if (role !== "admin") {
    return null;
  }

  return (
    <div className="card" style={{ marginTop: "30px", padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "14px",
        }}
      >
        <h3 style={{ margin: 0 }}>Admin Users</h3>

        <button
          onClick={() => {
            playClick();
            loadUsers();
          }}
          disabled={loading}
        >
          {loading ? "Chargement..." : "Rafraîchir"}
        </button>
      </div>

      <div
        className="card"
        style={{
          padding: "16px",
          marginBottom: "16px",
          background: "rgba(15, 23, 42, 0.45)",
        }}
      >
        <h4 style={{ marginTop: 0 }}>Modifier une balance</h4>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <select value={editingUser} onChange={(e) => setEditingUser(e.target.value)}>
            <option value="">Choisir un joueur</option>
            {users.map((user) => (
              <option key={user.email} value={user.email}>
                {user.email}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Nouvelle balance"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
          />

          <button onClick={handleSetBalance}>Appliquer</button>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: "16px",
          marginBottom: "16px",
          background: "rgba(15, 23, 42, 0.45)",
        }}
      >
        <h4 style={{ marginTop: 0 }}>Modifier un rôle</h4>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <select value={roleUser} onChange={(e) => setRoleUser(e.target.value)}>
            <option value="">Choisir un joueur</option>
            {users.map((user) => (
              <option key={user.email} value={user.email}>
                {user.email}
              </option>
            ))}
          </select>

          <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>

          <button onClick={handleSetRole}>Appliquer</button>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: "16px",
          marginBottom: "16px",
          background: "rgba(15, 23, 42, 0.45)",
        }}
      >
        <h4 style={{ marginTop: 0 }}>Réinitialiser un joueur</h4>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <select value={resetUser} onChange={(e) => setResetUser(e.target.value)}>
            <option value="">Choisir un joueur</option>
            {users.map((user) => (
              <option key={user.email} value={user.email}>
                {user.email}
              </option>
            ))}
          </select>

          <button onClick={handleResetPlayer}>Réinitialiser</button>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: "16px",
          marginBottom: "16px",
          background: "rgba(15, 23, 42, 0.45)",
        }}
      >
        <h4 style={{ marginTop: 0 }}>Modifier ELO</h4>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <select value={eloUser} onChange={(e) => setEloUser(e.target.value)}>
            <option value="">Choisir un joueur</option>
            {users.map((user) => (
              <option key={user.email} value={user.email}>
                {user.email}
              </option>
            ))}
          </select>

          <select value={eloGame} onChange={(e) => setEloGame(e.target.value)}>
            <option value="global">Global</option>
            <option value="snake">Viper</option>
            <option value="reflex">QuickShot</option>
            <option value="memory">FlipMatch</option>
            <option value="tetris">BlockDrop</option>
            <option value="checkers">DraughtWar</option>
            <option value="chess">KingSlayer</option>
            <option value="uno">ColorBlitz</option>
          </select>

          <input
            type="number"
            placeholder="Nouvel ELO"
            value={eloValue}
            onChange={(e) => setEloValue(e.target.value)}
          />

          <button onClick={handleSetElo}>Appliquer</button>
        </div>
      </div>

      {users.length === 0 ? (
        <p>Aucun utilisateur trouvé.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Rôle</th>
              <th>Nom affiché</th>
              <th>Balance</th>
              <th>ELO</th>
              <th>Wins</th>
              <th>Losses</th>
              <th>Games</th>
              <th>Streak</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email}>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.display_name || "-"}</td>
                <td>{user.balance}</td>
                <td>{user.elo}</td>
                <td>{user.wins}</td>
                <td>{user.losses}</td>
                <td>{user.games_played}</td>
                <td>{user.win_streak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}