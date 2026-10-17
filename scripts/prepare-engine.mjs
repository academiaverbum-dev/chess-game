import { mkdir, copyFile } from "node:fs/promises";
const dest = new URL("../public/engine/", import.meta.url);
await mkdir(dest, { recursive: true });
for (const [source, target] of [
  ["src/stockfish-17.1-lite-single-03e3232.js", "stockfish.js"],
  ["src/stockfish-17.1-lite-single-03e3232.wasm", "stockfish.wasm"],
  ["Copying.txt", "COPYING.txt"],
  ["AUTHORS", "AUTHORS.txt"],
])
  await copyFile(
    new URL("../node_modules/stockfish/" + source, import.meta.url),
    new URL(target, dest),
  );
