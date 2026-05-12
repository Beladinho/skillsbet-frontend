export function createInitialChessBoard() {
  const board = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null)
  );

  const backRow = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];

  for (let col = 0; col < 8; col += 1) {
    board[0][col] = { player: "bot", type: backRow[col] };
    board[1][col] = { player: "bot", type: "pawn" };

    board[6][col] = { player: "human", type: "pawn" };
    board[7][col] = { player: "human", type: backRow[col] };
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

function addSlidingMoves(board, row, col, piece, directions, moves) {
  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;

    while (isInsideBoard(r, c)) {
      const target = board[r][c];

      if (!target) {
        moves.push({
          fromRow: row,
          fromCol: col,
          toRow: r,
          toCol: c,
          type: "move",
        });
      } else {
        if (target.player !== piece.player) {
          moves.push({
            fromRow: row,
            fromCol: col,
            toRow: r,
            toCol: c,
            type: "capture",
          });
        }
        break;
      }

      r += dr;
      c += dc;
    }
  }
}

export function getValidChessMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];

  const moves = [];

  if (piece.type === "pawn") {
    const dir = piece.player === "human" ? -1 : 1;
    const startRow = piece.player === "human" ? 6 : 1;

    const oneForward = row + dir;
    if (isInsideBoard(oneForward, col) && !board[oneForward][col]) {
      moves.push({
        fromRow: row,
        fromCol: col,
        toRow: oneForward,
        toCol: col,
        type: "move",
      });

      const twoForward = row + dir * 2;
      if (
        row === startRow &&
        isInsideBoard(twoForward, col) &&
        !board[twoForward][col]
      ) {
        moves.push({
          fromRow: row,
          fromCol: col,
          toRow: twoForward,
          toCol: col,
          type: "move",
        });
      }
    }

    for (const dc of [-1, 1]) {
      const captureRow = row + dir;
      const captureCol = col + dc;

      if (!isInsideBoard(captureRow, captureCol)) continue;

      const target = board[captureRow][captureCol];
      if (target && target.player !== piece.player) {
        moves.push({
          fromRow: row,
          fromCol: col,
          toRow: captureRow,
          toCol: captureCol,
          type: "capture",
        });
      }
    }

    return moves;
  }

  if (piece.type === "rook") {
    addSlidingMoves(
      board,
      row,
      col,
      piece,
      [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ],
      moves
    );
    return moves;
  }

  if (piece.type === "bishop") {
    addSlidingMoves(
      board,
      row,
      col,
      piece,
      [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ],
      moves
    );
    return moves;
  }

  if (piece.type === "queen") {
    addSlidingMoves(
      board,
      row,
      col,
      piece,
      [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ],
      moves
    );
    return moves;
  }

  if (piece.type === "knight") {
    const jumps = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];

    for (const [dr, dc] of jumps) {
      const r = row + dr;
      const c = col + dc;

      if (!isInsideBoard(r, c)) continue;

      const target = board[r][c];
      if (!target || target.player !== piece.player) {
        moves.push({
          fromRow: row,
          fromCol: col,
          toRow: r,
          toCol: c,
          type: target ? "capture" : "move",
        });
      }
    }

    return moves;
  }

  if (piece.type === "king") {
    const steps = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dr, dc] of steps) {
      const r = row + dr;
      const c = col + dc;

      if (!isInsideBoard(r, c)) continue;

      const target = board[r][c];
      if (!target || target.player !== piece.player) {
        moves.push({
          fromRow: row,
          fromCol: col,
          toRow: r,
          toCol: c,
          type: target ? "capture" : "move",
        });
      }
    }

    return moves;
  }

  return moves;
}

export function applyChessMove(board, move) {
  const nextBoard = cloneBoard(board);
  const piece = nextBoard[move.fromRow][move.fromCol];

  nextBoard[move.fromRow][move.fromCol] = null;
  nextBoard[move.toRow][move.toCol] = piece;

  if (piece && piece.type === "pawn") {
    if (piece.player === "human" && move.toRow === 0) {
      piece.type = "queen";
    }
    if (piece.player === "bot" && move.toRow === 7) {
      piece.type = "queen";
    }
  }

  return nextBoard;
}

export function getAllChessMovesForPlayer(board, player) {
  const allMoves = [];

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col];
      if (!piece || piece.player !== player) continue;

      const moves = getValidChessMoves(board, row, col);
      for (const move of moves) {
        allMoves.push(move);
      }
    }
  }

  return allMoves;
}

export function findKings(board) {
  let humanKing = false;
  let botKing = false;

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col];
      if (!piece) continue;

      if (piece.type === "king" && piece.player === "human") {
        humanKing = true;
      }

      if (piece.type === "king" && piece.player === "bot") {
        botKing = true;
      }
    }
  }

  return { humanKing, botKing };
}