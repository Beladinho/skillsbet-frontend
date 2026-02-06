import { api } from "../../api";

export default function AdminDashboard() {
  const createQuest = async () => {
    await api.post("/admin/quests", {
      title: "Gagner 100 XP",
      xp: 100
    });
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <button onClick={createQuest}>Créer quête</button>
    </div>
  );
}
