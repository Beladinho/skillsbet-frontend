export function createInitialBoard() {
  const board = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null)
  );

  // Bot (haut)
  for (let row = 0; row < 3; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      if ((row + col) % 2 === 1) {
        board[row][col] = {
          player: "bot",
          king: false,
        };
      }
    }
  }

  // Player (bas)
  for (let row = 5; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      if ((row + col) % 2 === 1) {
        board[row][col] = {
          player: "human",
          king: false,
        };
      }
    }
  }

  return board;
}

export function cloneBoard(board) {
  return board.map((row) =>
    row.map((cell) => (cell ? { ...cell } : null))
  );
}

export function isInsideBoard(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export function getPieceDirections(piece) {
  if (piece.king) {
    return [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];
  }

  if (piece.player === "human") {
    return [
      [-1, -1],
      [-1, 1],
    ];
  }

  return [
    [1, -1],
    [1, 1],
  ];
}

export function getValidMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];

  const directions = getPieceDirections(piece);
  const moves = [];

  for (const [dr, dc] of directions) {
    const nextRow = row + dr;
    const nextCol = col + dc;

    // déplacement simple
    if (isInsideBoard(nextRow, nextCol) && !board[nextRow][nextCol]) {
      moves.push({
        type: "move",
        fromRow: row,
        fromCol: col,
        toRow: nextRow,
        toCol: nextCol,
      });
    }

    // capture
    const jumpRow = row + dr * 2;
    const jumpCol = col + dc * 2;

    if (
      isInsideBoard(jumpRow, jumpCol) &&
      board[nextRow] &&
      board[nextRow][nextCol] &&
      board[nextRow][nextCol].player !== piece.player &&
      !board[jumpRow][jumpCol]
    ) {
      moves.push({
        type: "capture",
        fromRow: row,
        fromCol: col,
        toRow: jumpRow,
        toCol: jumpCol,
        capturedRow: nextRow,
        capturedCol: nextCol,
      });
    }
  }

  return moves;
}

export function applyMove(board, move) {
  const nextBoard = cloneBoard(board);
  const piece = nextBoard[move.fromRow][move.fromCol];

  nextBoard[move.fromRow][move.fromCol] = null;
  nextBoard[move.toRow][move.toCol] = piece;

  // supprimer pièce capturée
  if (move.type === "capture") {
    nextBoard[move.capturedRow][move.capturedCol] = null;
  }

  // promotion en roi
  if (piece && piece.player === "human" && move.toRow === 0) {
    piece.king = true;
  }

  if (piece && piece.player === "bot" && move.toRow === 7) {
    piece.king = true;
  }

  return nextBoard;
}

export function countPieces(board) {
  let human = 0;
  let bot = 0;

  for (const row of board) {
    for (const cell of row) {
      if (!cell) continue;

      if (cell.player === "human") human += 1;
      if (cell.player === "bot") bot += 1;
    }
  }

  return { human, bot };
}

export function getAllMovesForPlayer(board, player) {
  const allMoves = [];

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col];

      if (!piece || piece.player !== player) continue;

      const moves = getValidMoves(board, row, col);

      for (const move of moves) {
        allMoves.push(move);
      }
    }
  }

  // priorité aux captures (règle des dames)
  const captures = allMoves.filter((m) => m.type === "capture");

  return captures.length > 0 ? captures : allMoves;
}