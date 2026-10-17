import { Chess, type Move, type PieceSymbol } from "chess.js";
export type Difficulty = "easy" | "medium" | "hard";
const value: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};
function evaluate(game: Chess, color: "w" | "b") {
  if (game.isCheckmate()) return game.turn() === color ? -100000 : 100000;
  if (game.isDraw()) return 0;
  return game
    .board()
    .flat()
    .reduce(
      (score, piece) =>
        score +
        (piece ? value[piece.type] * (piece.color === color ? 1 : -1) : 0),
      0,
    );
}
export function chooseMove(
  fen: string,
  difficulty: "easy" | "medium",
  random = Math.random,
): Move | null {
  const game = new Chess(fen);
  if (game.isGameOver()) return null;
  const moves = game.moves({ verbose: true });
  if (difficulty === "easy")
    return moves[
      Math.min(moves.length - 1, Math.floor(random() * moves.length))
    ];
  const color = game.turn();
  let best = -Infinity;
  let choices: Move[] = [];
  for (const move of moves) {
    game.move(move);
    let score = evaluate(game, color);
    // A resposta mais favorável ao adversário penaliza peças deixadas sem proteção.
    if (!game.isGameOver()) {
      let worst = Infinity;
      for (const reply of game.moves({ verbose: true })) {
        game.move(reply);
        worst = Math.min(worst, evaluate(game, color));
        game.undo();
      }
      score = worst;
    }
    game.undo();
    if (score > best) {
      best = score;
      choices = [move];
    } else if (score === best) choices.push(move);
  }
  return choices[
    Math.min(choices.length - 1, Math.floor(random() * choices.length))
  ];
}
export function undoTurn(game: Chess, computer: boolean) {
  const last = game.undo();
  if (computer && last?.color === "b" && game.history().length) game.undo();
}
