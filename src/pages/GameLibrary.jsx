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

        <GameCard title="Snake" play={() => startGame("snake")} />

        <GameCard title="Memory" play={() => startGame("memory")} />

        <GameCard title="Chess" play={() => startGame("chess")} />

        <GameCard title="Checkers" play={() => startGame("checkers")} />

        <GameCard title="Tetris" play={() => startGame("tetris")} />

        <GameCard title="Reflex" play={() => startGame("reflex")} />

        <GameCard title="UNO" play={() => startGame("uno")} />

      </div>

    </div>

  );

}