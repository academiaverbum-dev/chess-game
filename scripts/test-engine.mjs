import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { Chess } from "chess.js";
const require = createRequire(import.meta.url);
const init = require("../node_modules/stockfish/src/stockfish-17.1-lite-single-03e3232.js");
const wasm = fileURLToPath(
  new URL("../public/engine/stockfish.wasm", import.meta.url),
);
const game = new Chess();
game.move("e4");
const timer = setTimeout(() => {
  console.error("Stockfish: timeout");
  process.exit(1);
}, 20000);
const send = (command) =>
  setImmediate(() =>
    engine.ccall("command", null, ["string"], [command], {
      async: /^go\b/.test(command),
    }),
  );
const engine = {
  locateFile: () => wasm,
  listener: (line) => {
    if (line === "uciok") send("isready");
    if (line === "readyok") {
      send(`position fen ${game.fen()}`);
      send("go depth 8 movetime 1200");
    }
    if (line.startsWith("bestmove ")) {
      const move = line.split(/\s+/)[1];
      game.move({
        from: move.slice(0, 2),
        to: move.slice(2, 4),
        promotion: move[4],
      });
      console.log(`Stockfish WASM real: movimento legal ${move}`);
      clearTimeout(timer);
    }
  },
};
init()(engine)
  .then(function ready() {
    if (engine._isReady && !engine._isReady()) {
      setTimeout(ready, 10);
      return;
    }
    send("uci");
  })
  .catch((error) => {
    clearTimeout(timer);
    console.error(error);
    process.exitCode = 1;
  });
