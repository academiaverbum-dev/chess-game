import { Chess, type Square, type PieceSymbol } from "chess.js";
export const names: Record<PieceSymbol, string> = {
  p: "peão",
  r: "torre",
  n: "cavalo",
  b: "bispo",
  q: "dama",
  k: "rei",
};
export function status(game: Chess) {
  const player = game.turn() === "w" ? "brancas" : "pretas";
  if (game.isCheckmate())
    return `Xeque-mate! Vitória das ${game.turn() === "w" ? "pretas" : "brancas"}.`;
  if (game.isStalemate()) return "Empate por afogamento.";
  if (game.isInsufficientMaterial()) return "Empate por material insuficiente.";
  if (game.isThreefoldRepetition()) return "Empate por repetição de posição.";
  if (game.isDrawByFiftyMoves()) return "Empate pela regra dos 50 lances.";
  if (game.isDraw()) return "Empate.";
  return `${game.isCheck() ? "Xeque! " : ""}Vez das ${player}.`;
}
export function play(
  game: Chess,
  from: Square,
  to: Square,
  promotion?: string,
) {
  if (game.isGameOver()) return false;
  try {
    game.move({ from, to, ...(promotion ? { promotion } : {}) });
    return true;
  } catch {
    return false;
  }
}
