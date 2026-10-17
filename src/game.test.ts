import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { play, status } from "./game";
describe("Regras da partida", () => {
  it("começa com 32 peças e 20 movimentos legais", () => {
    const g = new Chess();
    expect(g.board().flat().filter(Boolean)).toHaveLength(32);
    expect(g.moves()).toHaveLength(20);
  });
  it("valida movimentos e alterna os turnos", () => {
    const g = new Chess();
    const fen = g.fen();
    expect(play(g, "e2", "e5")).toBe(false);
    expect(g.fen()).toBe(fen);
    expect(play(g, "e2", "e4")).toBe(true);
    expect(g.turn()).toBe("b");
    expect(play(g, "d2", "d4")).toBe(false);
  });
  it("permite roque e desloca a torre", () => {
    const g = new Chess("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
    expect(play(g, "e1", "g1")).toBe(true);
    expect(g.get("f1")?.type).toBe("r");
    expect(g.get("g1")?.type).toBe("k");
  });
  it("permite captura en passant", () => {
    const g = new Chess();
    ["e4", "a6", "e5", "d5"].forEach((m) => g.move(m));
    expect(play(g, "e5", "d6")).toBe(true);
    expect(g.get("d5")).toBeUndefined();
  });
  it("promove para a peça escolhida", () => {
    const g = new Chess("7k/P7/8/8/8/8/8/7K w - - 0 1");
    expect(play(g, "a7", "a8", "n")).toBe(true);
    expect(g.get("a8")?.type).toBe("n");
  });
  it("detecta xeque e impede deixar o rei em xeque", () => {
    const g = new Chess("4k3/8/8/8/8/8/4r3/R3K3 w Q - 0 1");
    expect(status(g)).toContain("Xeque!");
    expect(play(g, "a1", "a2")).toBe(false);
  });
  it("detecta xeque-mate e bloqueia novos lances", () => {
    const g = new Chess();
    ["f3", "e5", "g4", "Qh4#"].forEach((m) => g.move(m));
    expect(status(g)).toBe("Xeque-mate! Vitória das pretas.");
    expect(play(g, "e2", "e4")).toBe(false);
  });
  it("detecta afogamento e material insuficiente", () => {
    expect(status(new Chess("7k/5K2/6Q1/8/8/8/8/8 b - - 0 1"))).toBe(
      "Empate por afogamento.",
    );
    expect(status(new Chess("7k/8/8/8/8/8/8/K7 w - - 0 1"))).toBe(
      "Empate por material insuficiente.",
    );
  });
  it("detecta repetição e regra dos 50 lances", () => {
    const g = new Chess();
    ["Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8"].forEach((m) =>
      g.move(m),
    );
    expect(status(g)).toContain("repetição");
    expect(status(new Chess("7k/8/8/8/8/8/R7/K7 w - - 100 51"))).toContain(
      "50 lances",
    );
  });
});
