import GameCard from "../components/ui/GameCard";

export default function GameLibrary({ startGame }) {

  return (

    <div
      style={{
        background: "#12121c",
        minHeight: "100vh",
        padding: "40px",
        color: "white",
        textAlign: "center"
      }}
    >

      <h1>Game Library</h1>

      <br />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap"
        }}
      >

        <GameCard title="Viper" play={() => startGame("snake")} />

        <GameCard title="FlipMatch" play={() => startGame("memory")} />

        <GameCard title="KingSlayer" play={() => startGame("chess")} />

        <GameCard title="DraughtWar" play={() => startGame("checkers")} />

        <GameCard title="BlockDrop" play={() => startGame("tetris")} />

        <GameCard title="QuickShot" play={() => startGame("reflex")} />

        <GameCard title="ColorBlitz" play={() => startGame("uno")} />

        <GameCard title="LineUp4" play={() => startGame("lineup4")} />

        <GameCard title="XO Battle" play={() => startGame("xobattle")} />

      </div>

    </div>

  );

}