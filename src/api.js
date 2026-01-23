const API_URL = import.meta.env.VITE_API_URL;

export async function getSkills() {
  const response = await fetch(`${API_URL}/api/skills`);
  if (!response.ok) {
    throw new Error("Erreur API");
  }
  return response.json();
}
