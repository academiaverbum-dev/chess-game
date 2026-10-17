import { afterEach, expect, it, vi } from "vitest";
import { computerMove } from "./computer";
class FakeWorker {
  static last: FakeWorker;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: (() => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();
  constructor(public url: URL) {
    FakeWorker.last = this;
  }
  emit(data: unknown) {
    this.onmessage?.({ data });
  }
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
it("Stockfish usa o subcaminho do Pages e espera UCI antes de analisar", async () => {
  vi.stubEnv("BASE_URL", "./");
  window.history.replaceState({}, "", "/chess-game/");
  vi.stubGlobal("Worker", FakeWorker);
  const promise = computerMove(
    "fen-de-teste",
    "hard",
    new AbortController().signal,
  );
  const worker = FakeWorker.last;
  expect(worker.url.pathname).toBe("/chess-game/engine/stockfish.js");
  expect(worker.postMessage).toHaveBeenCalledWith("uci");
  worker.emit("uciok");
  expect(worker.postMessage).toHaveBeenCalledWith("isready");
  worker.emit("readyok");
  expect(worker.postMessage).toHaveBeenCalledWith("go depth 8 movetime 1200");
  worker.emit("bestmove e7e5 ponder g1f3");
  await expect(promise).resolves.toBe("e7e5");
  expect(worker.terminate).toHaveBeenCalled();
});
it("cancela o worker pendente", async () => {
  vi.stubGlobal("Worker", FakeWorker);
  const controller = new AbortController();
  const promise = computerMove("fen", "easy", controller.signal);
  controller.abort();
  await expect(promise).rejects.toMatchObject({ name: "AbortError" });
  expect(FakeWorker.last.terminate).toHaveBeenCalled();
});
it("informa falha de carregamento", async () => {
  vi.stubGlobal("Worker", FakeWorker);
  const promise = computerMove("fen", "hard", new AbortController().signal);
  FakeWorker.last.onerror?.();
  await expect(promise).rejects.toThrow("iniciar o motor");
});
it("informa timeout", async () => {
  vi.useFakeTimers();
  vi.stubGlobal("Worker", FakeWorker);
  const promise = computerMove("fen", "hard", new AbortController().signal);
  const assertion = expect(promise).rejects.toThrow("demorou");
  await vi.advanceTimersByTimeAsync(20000);
  await assertion;
});
it("rejeita resposta inválida do Stockfish", async () => {
  vi.stubGlobal("Worker", FakeWorker);
  const promise = computerMove("fen", "hard", new AbortController().signal);
  FakeWorker.last.emit("bestmove (none)");
  await expect(promise).rejects.toThrow("inválido");
});
