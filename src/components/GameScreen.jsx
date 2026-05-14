import { lazy, Suspense } from "react";
import { useAppSettings } from "../context/AppSettingsContext";
import SessionBar from "./SessionBar";
import DuelHUD from "./DuelHUD";

const GAMES = {
  reflex: lazy(() => import("./games/ReflexGame")),
  snake: lazy(() => import("./games/SnakeGame")),
  memory: lazy(() => import("./games/MemoryGame")),
  tetris: lazy(() => import("./games/TetrisGame")),
  checkers: lazy(() => import("./games/CheckersGame")),
  chess: lazy(() => import("./games/ChessGame")),
  dames: lazy(() => import("./games/DamesGame")),
  uno: lazy(() => import("./games/UNOGame")),
  lineup4: lazy(() => import("./games/LineUp4Game")),
  xobattle: lazy(() => import("./games/XOBattleGame")),
};

export default function GameScreen({ duel, playerId, socketState, liveScores, chatMessages, onSendChat, onGameFinished }) {
  const { tr } = useAppSettings();
  const GameComponent = GAMES[duel?.game];

  return (
    <div style={{ padding: "24px" }}>
      <SessionBar />
      <h1>{tr("appName")}</h1>
      <h2>
        {tr("welcome")}, {playerId}
      </h2>
      <DuelHUD
        duel={duel}
        socketState={socketState}
        liveScores={liveScores}
        playerId={playerId}
        chatMessages={chatMessages}
        onSendChat={onSendChat}
      />
      {GameComponent ? (
        <Suspense fallback={<p>Chargement du jeu…</p>}>
          <GameComponent
            duel={duel}
            playerId={playerId}
            onGameFinished={onGameFinished}
          />
        </Suspense>
      ) : (
        <p>Jeu inconnu : {duel?.game}</p>
      )}
    </div>
  );
}
