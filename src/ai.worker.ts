import { chooseMove } from "./ai";
self.onmessage = (
  event: MessageEvent<{ fen: string; difficulty: "easy" | "medium" }>,
) => {
  try {
    self.postMessage({
      move: chooseMove(event.data.fen, event.data.difficulty),
    });
  } catch {
    self.postMessage({ error: "Não foi possível calcular o lance." });
  }
};
