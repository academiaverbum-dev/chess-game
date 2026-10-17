import { expect, it } from "vitest";
import { Chess } from "chess.js";
import { chooseMove, undoTurn } from "./ai";
it.each(["easy", "medium"] as const)(
  "%s retorna apenas movimentos legais sem alterar a posição",
  (difficulty) => {
    const game = new Chess();
    game.move("e4");
    const fen = game.fen();
    for (const random of [() => 0, () => 0.5, () => 0.999]) {
      const move = chooseMove(fen, difficulty, random)!;
      expect(game.moves()).toContain(move.san);
      expect(game.fen()).toBe(fen);
    }
  },
);
it("médio captura uma dama desprotegida", () => {
  const game = new Chess("7k/8/8/4q3/8/8/4R3/7K w - - 0 1");
  expect(chooseMove(game.fen(), "medium", () => 0)?.to).toBe("e5");
});
it("médio evita perder a dama na resposta", () => {
  const game = new Chess("6k1/8/8/4r3/8/8/4Q3/6K1 w - - 0 1");
  const move = chooseMove(game.fen(), "medium", () => 0)!;
  game.move(move);
  expect(
    game.moves({ verbose: true }).filter((m) => m.captured === "q"),
  ).toHaveLength(0);
});
it("não calcula depois de xeque-mate", () => {
  const game = new Chess();
  ["f3", "e5", "g4", "Qh4#"].forEach((m) => game.move(m));
  expect(chooseMove(game.fen(), "easy")).toBeNull();
  expect(chooseMove(game.fen(), "medium")).toBeNull();
});
it("desfaz o par completo ou o lance humano pendente", () => {
  const game = new Chess();
  const initial = game.fen();
  game.move("e4");
  game.move("e5");
  undoTurn(game, true);
  expect(game.fen()).toBe(initial);
  game.move("d4");
  undoTurn(game, true);
  expect(game.fen()).toBe(initial);
  game.move("e4");
  game.move("e5");
  undoTurn(game, false);
  expect(game.history()).toEqual(["e4"]);
});
