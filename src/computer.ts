import type { Difficulty } from "./ai";
export function computerMove(
  fen: string,
  difficulty: Difficulty,
  signal: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let worker: Worker | undefined;
    let timer: ReturnType<typeof setTimeout>;
    let searching = false;
    let initialized = false;
    const finish = (error?: Error, move?: string) => {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      worker?.terminate();
      if (error) reject(error);
      else resolve(move!);
    };
    const abort = () =>
      finish(new DOMException("Cálculo cancelado", "AbortError"));
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener("abort", abort, { once: true });
    timer = setTimeout(
      () => finish(new Error("O computador demorou demais para responder.")),
      20000,
    );
    try {
      worker =
        difficulty === "hard"
          ? new Worker(
              new URL(
                `${import.meta.env.BASE_URL}engine/stockfish.js`,
                window.location.href,
              ),
            )
          : new Worker(new URL("./ai.worker.ts", import.meta.url), {
              type: "module",
            });
      worker.onerror = () =>
        finish(
          new Error(
            "Não foi possível iniciar o motor. Tente novamente ou escolha outra dificuldade.",
          ),
        );
      worker.onmessage = (event: MessageEvent) => {
        if (difficulty !== "hard") {
          if (event.data.error || !event.data.move)
            finish(new Error(event.data.error || "Nenhum lance recebido."));
          else {
            const m = event.data.move;
            finish(undefined, m.from + m.to + (m.promotion || ""));
          }
          return;
        }
        const line = String(event.data).trim();
        if (line === "uciok" && !initialized) {
          initialized = true;
          worker!.postMessage("setoption name Hash value 16");
          worker!.postMessage("isready");
        }
        if (line === "readyok" && !searching) {
          searching = true;
          worker!.postMessage(`position fen ${fen}`);
          worker!.postMessage("go depth 8 movetime 1200");
        }
        if (line.startsWith("bestmove ")) {
          const move = line.split(/\s+/)[1];
          if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move))
            finish(new Error("O motor retornou um lance inválido."));
          else finish(undefined, move);
        }
      };
      worker.postMessage(difficulty === "hard" ? "uci" : { fen, difficulty });
    } catch {
      finish(
        new Error("Este navegador não conseguiu iniciar o motor de xadrez."),
      );
    }
  });
}
