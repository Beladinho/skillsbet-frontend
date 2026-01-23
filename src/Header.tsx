import React from "react";

interface HeaderProps {
  onNavigate: (page: string) => void;
}

export default function Header({ onNavigate }: HeaderProps) {
  return (
    <header style={{ display: "flex", gap: 20, padding: 20, borderBottom: "1px solid #ccc" }}>
      <button onClick={() => onNavigate("home")}>Accueil</button>
      <button onClick={() => onNavigate("games")}>Jeux</button>
      <button onClick={() => onNavigate("leaderboard")}>Classement</button>
      <button onClick={() => onNavigate("profile")}>Profil</button>
    </header>
  );
}
