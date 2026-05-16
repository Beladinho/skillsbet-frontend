import { submitScore, finishDuel, submitResult } from "../api/skillsbetApi";

function safeBotScore(botScoreGenerator) {
  if (typeof botScoreGenerator === "function") {
    return Number(botScoreGenerator()) || 0;
  }
  return 0;
}

export async function completeDuelWithBotScore({
  duel,
  playerId,
  playerScore,
  botScoreGenerator,
}) {
  if (!duel?.duel_id) {
    throw new Error("Duel introuvable.");
  }

  const duelId = duel.duel_id;
  const player1 = duel.player1;
  const player2 = duel.player2;

  const isBotMatch = player1 === "Bot Alpha" || player2 === "Bot Alpha";
  const botId = player1 === "Bot Alpha" ? player1 : player2;

  if (!isBotMatch || !botId) {
    await submitScore(duelId, playerId, Number(playerScore) || 0);
    return finishDuel(duelId);
  }

  const botScore = safeBotScore(botScoreGenerator);

  // On soumet uniquement le score du vrai joueur
  await submitScore(duelId, playerId, Number(playerScore) || 0);

  const winnerId =
    Number(playerScore) > botScore
      ? playerId
      : botScore > Number(playerScore)
      ? botId
      : null;

  if (winnerId === null) {
    return submitResult({
      duelId,
      draw: true,
    });
  }

  return submitResult({
    duelId,
    winnerId,
    loserId: winnerId === playerId ? botId : playerId,
    draw: false,
  });
}

export async function completeDuelWithWinner({
  duel,
  winnerId = null,
  loserId = null,
  draw = false,
  events = null,
  durationSeconds = null,
}) {
  if (!duel?.duel_id) {
    throw new Error("Duel introuvable.");
  }

  return submitResult({
    duelId: duel.duel_id,
    winnerId,
    loserId,
    draw,
    events,
    durationSeconds,
  });
}